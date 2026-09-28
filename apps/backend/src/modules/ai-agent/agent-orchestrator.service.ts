import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';


import { AgentChangesetService } from './agent-changeset.service';
import { AgentFileChange } from './dto/agent-changeset.dto';
import { AgentRunResult, AgentToolCall, AgentToolEvent, AgentToolName, RunAgentDto } from './dto/run-agent.dto';
import { AgentValidationService } from './tools/agent-validation.service';
import { RepositoryToolsService, RepositoryTreeItem } from './tools/repository-tools.service';

import { AI_PROVIDER, AIProvider, ChatMessage } from '@/modules/ai-provider/ai-provider.interface';

interface OrchestratorContext {
  userId: string;
  dto: RunAgentDto;
  changesetId: string;
  tree: RepositoryTreeItem[];
  filesRead: Map<string, string>;
  filesInspected: string[];
  toolsUsed: string[];
  proposedChanges: AgentFileChange[];
  validationAttempts: number;
  cancelled: boolean;
}

@Injectable()
export class AgentOrchestratorService {
  private readonly logger = new Logger(AgentOrchestratorService.name);
  private static readonly MAX_ITERATIONS = 8;
  private static readonly MAX_VALIDATION_ATTEMPTS = 3;

  constructor(
    @Inject(AI_PROVIDER) private readonly aiProvider: AIProvider,
    private readonly repoTools: RepositoryToolsService,
    private readonly changesetService: AgentChangesetService,
    private readonly validationService: AgentValidationService,
  ) {}

  async *run(userId: string, dto: RunAgentDto, runId: string): AsyncGenerator<AgentToolEvent> {
    const owner = dto.repoOwner ?? 'workspace';
    const repo = dto.repoName ?? 'default';
    const branch = dto.branch ?? 'main';

    const changeset = this.changesetService.createChangeset(
      runId,
      userId,
      owner,
      repo,
      branch,
      dto.task,
    );

    const ctx: OrchestratorContext = {
      userId,
      dto,
      changesetId: changeset.id,
      tree: [],
      filesRead: new Map(),
      filesInspected: [],
      toolsUsed: [],
      proposedChanges: [],
      validationAttempts: 0,
      cancelled: false,
    };

    const conversationHistory: ChatMessage[] = [];

    const initialUserMessage = this.buildInitialMessage(dto);
    conversationHistory.push({ role: 'user', content: initialUserMessage });

    if (dto.repoOwner && dto.repoName && dto.branch) {
      yield { type: 'tool_call', tool: 'get_repository_tree', args: { owner: dto.repoOwner, repo: dto.repoName, branch: dto.branch } };
      ctx.tree = await this.repoTools.getRepositoryTree(userId, dto.repoOwner, dto.repoName, dto.branch);
      ctx.toolsUsed.push('get_repository_tree');

      const treeSnapshot = ctx.tree
        .filter((n) => n.type === 'blob')
        .map((n) => n.path)
        .slice(0, 100)
        .join('\n');

      yield { type: 'tool_result', tool: 'get_repository_tree', result: `Found ${ctx.tree.length} files.` };
      conversationHistory.push({
        role: 'user',
        content: `Repository tree (${ctx.tree.length} files):\n${treeSnapshot}`,
      });
    }

    for (let iteration = 0; iteration < AgentOrchestratorService.MAX_ITERATIONS; iteration++) {
      if (ctx.cancelled) {
        yield { type: 'cancelled', message: 'Agent cancelled by user.' };
        return;
      }

      const systemPrompt = this.buildSystemPrompt(iteration, ctx);
      yield { type: 'thinking', message: `Iteration ${iteration + 1} — reasoning & planning...` };

      const aiResponse = await this.aiProvider.complete(conversationHistory, systemPrompt, dto.modelId);

      if (ctx.cancelled) {
        yield { type: 'cancelled', message: 'Agent cancelled by user.' };
        return;
      }

      const toolCall = this.extractToolCall(aiResponse);

      if (toolCall) {
        yield { type: 'tool_call', tool: toolCall.tool, args: toolCall.args };

        // ── Phase 4 Controlled Validation Tools Execution ───────────────
        if (['run_typecheck', 'run_lint', 'run_tests', 'run_build'].includes(toolCall.tool)) {
          const cmdName = toolCall.tool.replace('run_', '') as any;
          yield { type: 'validation_started', tool: toolCall.tool };

          const valResult = await this.validationService.runValidation(cmdName, ctx.filesInspected);
          ctx.toolsUsed.push(toolCall.tool);
          ctx.validationAttempts++;

          yield { type: 'validation_completed', validationResult: valResult };
          yield { type: 'tool_result', tool: toolCall.tool, result: valResult.summary };

          conversationHistory.push({ role: 'assistant', content: aiResponse });
          conversationHistory.push({
            role: 'user',
            content: `Validation result for ${toolCall.tool}:\nSuccess: ${valResult.success}\nErrors (${valResult.errorCount}):\n${JSON.stringify(valResult.parsedErrors, null, 2)}\nSummary: ${valResult.summary}`,
          });

          if (!valResult.success && ctx.validationAttempts >= AgentOrchestratorService.MAX_VALIDATION_ATTEMPTS) {
            yield {
              type: 'thinking',
              message: 'Maximum automatic validation retry limit (3) reached. Agent stopped fix loop.',
            };
          }
          continue;
        }

        const result = await this.executeTool(ctx, toolCall);
        ctx.toolsUsed.push(toolCall.tool);

        if (callIsMutation(toolCall.tool)) {
          const lastChange = ctx.proposedChanges[ctx.proposedChanges.length - 1];
          if (lastChange) {
            yield {
              type: 'change_proposed',
              change: lastChange,
              changesetId: ctx.changesetId,
            } as any;
          }
        }

        yield { type: 'tool_result', tool: toolCall.tool, result: result.slice(0, 500) };

        conversationHistory.push({ role: 'assistant', content: aiResponse });
        conversationHistory.push({ role: 'user', content: `Tool result for ${toolCall.tool}:\n${result}` });
      } else {
        const plan = this.extractPlan(aiResponse, dto.task, ctx);
        if (plan) {
          this.changesetService.markReady(ctx.changesetId, userId);
          yield { type: 'changeset_ready', changesetId: ctx.changesetId, totalChanges: ctx.proposedChanges.length } as any;
          yield { type: 'plan_ready', plan };
          return;
        }

        conversationHistory.push({ role: 'assistant', content: aiResponse });
        conversationHistory.push({
          role: 'user',
          content: 'Now produce the final PLAN_JSON based on your analysis and proposed changes. Do not call any more tools.',
        });
      }
    }

    this.changesetService.markReady(ctx.changesetId, userId);
    yield { type: 'changeset_ready', changesetId: ctx.changesetId, totalChanges: ctx.proposedChanges.length } as any;
    yield { type: 'plan_ready', plan: this.buildFallbackPlan(dto.task, ctx) };
  }

  // ─── Tool Execution ───────────────────────────────────────────────

  private async executeTool(ctx: OrchestratorContext, call: AgentToolCall): Promise<string> {
    const { userId, dto } = ctx;
    const owner = dto.repoOwner ?? '';
    const repo = dto.repoName ?? '';
    const branch = dto.branch ?? 'main';

    try {
      switch (call.tool) {
        case 'get_repository_tree': {
          if (!owner || !repo) return 'No repository context provided.';
          ctx.tree = await this.repoTools.getRepositoryTree(userId, owner, repo, branch);
          return ctx.tree.filter((n) => n.type === 'blob').map((n) => n.path).join('\n') || 'Empty tree.';
        }

        case 'read_file': {
          const path = call.args['path'] ?? '';
          if (!path) return 'Missing path argument.';
          if (!ctx.filesInspected.includes(path)) ctx.filesInspected.push(path);
          if (ctx.filesRead.has(path)) return ctx.filesRead.get(path)!;

          let content = '';
          if (owner && repo) {
            content = await this.repoTools.readFile(userId, owner, repo, path, branch);
          } else if (path === dto.filePath) {
            content = dto.fileContent ?? '';
          }

          ctx.filesRead.set(path, content);
          return content || '(empty file)';
        }

        case 'search_code': {
          const query = call.args['query'] ?? '';
          if (!query) return 'No query provided.';
          if (ctx.tree.length === 0 && owner && repo) {
            ctx.tree = await this.repoTools.getRepositoryTree(userId, owner, repo, branch);
          }
          const matches = this.repoTools.searchCode(ctx.tree, query);
          return matches.length > 0 ? matches.join('\n') : `No files found matching "${query}".`;
        }

        case 'get_dependencies': {
          if (!owner || !repo) return 'No repository context.';
          const pkgContent = await this.repoTools.readFile(userId, owner, repo, 'package.json', branch);
          if (!pkgContent) return 'No package.json found.';
          const deps = this.repoTools.parseDependencies(pkgContent);
          return `Framework: ${deps.framework || 'Unknown'}\nDependencies: ${Object.keys(deps.dependencies).join(', ')}`;
        }

        case 'get_current_file':
          return dto.filePath
            ? `Current file: ${dto.filePath}\n\n${(dto.fileContent ?? '').slice(0, 3000)}`
            : 'No file open.';

        case 'get_selected_code':
          return dto.selectedCode ? `Selected code:\n${dto.selectedCode}` : 'No code selected.';

        case 'get_problems':
          if (!dto.problems || dto.problems.length === 0) return 'No diagnostics reported.';
          return dto.problems.map((p) => `[${p.severity}] ${p.file ?? ''}:${p.line ?? 0} — ${p.message}`).join('\n');

        case 'propose_file_change': {
          const path = call.args['path'] ?? '';
          const proposedContent = call.args['proposedContent'] ?? call.args['content'] ?? '';
          const reason = call.args['reason'] ?? 'Proposed code edit';

          if (!path) return 'Error: path argument is required for propose_file_change';

          let originalContent = ctx.filesRead.get(path) ?? '';
          if (!originalContent && owner && repo) {
            originalContent = await this.repoTools.readFile(userId, owner, repo, path, branch);
            ctx.filesRead.set(path, originalContent);
          }

          const change = this.changesetService.addChange(
            ctx.changesetId,
            userId,
            path,
            'MODIFY',
            originalContent,
            proposedContent,
            reason,
          );
          ctx.proposedChanges.push(change);
          if (!ctx.filesInspected.includes(path)) ctx.filesInspected.push(path);

          return `Successfully proposed MODIFY change for ${path}. (Changeset ID: ${ctx.changesetId})`;
        }

        case 'propose_new_file': {
          const path = call.args['path'] ?? '';
          const content = call.args['content'] ?? call.args['proposedContent'] ?? '';
          const reason = call.args['reason'] ?? 'Creating new file';

          if (!path) return 'Error: path argument is required for propose_new_file';

          const change = this.changesetService.addChange(
            ctx.changesetId,
            userId,
            path,
            'CREATE',
            '',
            content,
            reason,
          );
          ctx.proposedChanges.push(change);
          if (!ctx.filesInspected.includes(path)) ctx.filesInspected.push(path);

          return `Successfully proposed CREATE new file ${path}.`;
        }

        case 'propose_delete_file': {
          const path = call.args['path'] ?? '';
          const reason = call.args['reason'] ?? 'Deleting obsolete file';

          if (!path) return 'Error: path argument is required for propose_delete_file';

          let originalContent = ctx.filesRead.get(path) ?? '';
          if (!originalContent && owner && repo) {
            originalContent = await this.repoTools.readFile(userId, owner, repo, path, branch);
          }

          const change = this.changesetService.addChange(
            ctx.changesetId,
            userId,
            path,
            'DELETE',
            originalContent,
            '',
            reason,
          );
          ctx.proposedChanges.push(change);

          return `Successfully proposed DELETE for file ${path}. Requires explicit user confirmation.`;
        }

        default:
          return 'Unknown tool.';
      }
    } catch (err: any) {
      this.logger.warn(`Tool ${call.tool} failed: ${err.message}`);
      return `Tool error: ${err.message}`;
    }
  }

  // ─── Parsers & Helpers ─────────────────────────────────────────────

  private extractToolCall(response: string): AgentToolCall | null {
    const match = response.match(/TOOL_CALL:\s*(\w+)\s*(\{[\s\S]*?\n?\})/i);
    if (!match) return null;

    const toolName = (match[1] ?? '').toLowerCase() as AgentToolName;
    const validTools: AgentToolName[] = [
      'get_repository_tree', 'read_file', 'search_code',
      'get_dependencies', 'get_current_file', 'get_selected_code', 'get_problems',
      'propose_file_change', 'propose_new_file', 'propose_delete_file',
      'run_typecheck', 'run_lint', 'run_tests', 'run_build',
    ];

    if (!validTools.includes(toolName)) return null;

    let args: Record<string, string> = {};
    if (match[2]) {
      try {
        args = JSON.parse(match[2]);
      } catch {
        // Fallback for simple args matching
      }
    }

    return { tool: toolName, args };
  }

  private extractPlan(response: string, task: string, ctx: OrchestratorContext): AgentRunResult | null {
    const match = response.match(/PLAN_JSON:\s*(\{[\s\S]*\})/);
    if (!match) return null;
    try {
      const raw = JSON.parse(match[1] ?? '{}') as Partial<AgentRunResult>;
      return {
        task: raw.task ?? task,
        summary: raw.summary ?? 'Implementation plan generated.',
        architectureOverview: raw.architectureOverview,
        toolsUsed: ctx.toolsUsed,
        filesInspected: ctx.filesInspected,
        changesetId: ctx.changesetId,
        steps: Array.isArray(raw.steps) && raw.steps.length > 0 ? raw.steps : this.defaultSteps(task),
      };
    } catch {
      return null;
    }
  }

  private buildSystemPrompt(iteration: number, ctx: OrchestratorContext): string {
    const isLastIteration = iteration >= AgentOrchestratorService.MAX_ITERATIONS - 1;
    const toolDocs = `
Available tools:
  - Inspection: get_repository_tree, read_file, search_code, get_dependencies, get_current_file, get_selected_code, get_problems
  - Proposals: propose_file_change, propose_new_file, propose_delete_file
  - Safe Validation (PHASE 4):
      TOOL_CALL: run_typecheck {}
      TOOL_CALL: run_lint {}
      TOOL_CALL: run_tests {}
      TOOL_CALL: run_build {}

Rules:
- Run validation (run_typecheck / run_lint) after proposing changes to verify accuracy.
- Max automatic validation attempts: ${AgentOrchestratorService.MAX_VALIDATION_ATTEMPTS}.
- After completing validation and plan, respond with PLAN_JSON:
  PLAN_JSON: {"task":"...","summary":"...","steps":[{"id":"step-1","title":"...","description":"...","targetFiles":["..."],"status":"pending"}]}`;

    if (isLastIteration) {
      return `You are Codentra Agent. Produce the final PLAN_JSON now based on your proposals and validation results.${toolDocs}`;
    }

    return `You are Codentra Agent. Proposed changes: ${ctx.proposedChanges.length}. Validation attempts: ${ctx.validationAttempts}/${AgentOrchestratorService.MAX_VALIDATION_ATTEMPTS}.${toolDocs}`;
  }

  private buildInitialMessage(dto: RunAgentDto): string {
    const lines = [`Task: "${dto.task}"`];
    if (dto.repoOwner && dto.repoName) lines.push(`Repository: ${dto.repoOwner}/${dto.repoName} (${dto.branch ?? 'main'})`);
    if (dto.filePath) lines.push(`Current open file: ${dto.filePath}`);
    lines.push('\nInspect the codebase, propose file changes, and run safe validation checks.');
    return lines.join('\n');
  }

  private buildFallbackPlan(task: string, ctx: OrchestratorContext): AgentRunResult {
    return {
      task,
      summary: `Implementation plan for: ${task}`,
      toolsUsed: ctx.toolsUsed,
      filesInspected: ctx.filesInspected,
      changesetId: ctx.changesetId,
      steps: this.defaultSteps(task),
    };
  }

  private defaultSteps(_task: string) {
    return [
      { id: 'step-1', title: 'Audit Codebase', description: 'Analyze architecture.', status: 'pending' as const },
      { id: 'step-2', title: 'Propose Modifications', description: 'Prepare changeset.', status: 'pending' as const },
      { id: 'step-3', title: 'Run Safe Validation', description: 'Run typecheck and linting.', status: 'pending' as const },
      { id: 'step-4', title: 'User Review & Apply', description: 'Review diffs and apply to workspace.', status: 'pending' as const },
    ];
  }
}

function callIsMutation(tool: string): boolean {
  return ['propose_file_change', 'propose_new_file', 'propose_delete_file'].includes(tool);
}
