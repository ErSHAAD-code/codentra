import { Inject, Injectable } from '@nestjs/common';
import { ArtifactType } from '@prisma/client';

import { EditorAiPromptDto, EditorAiResponse } from './dto/editor-ai.dto';
import { EditorReviewRequestDto, EditorReviewResult } from './dto/editor-review.dto';
import { PROMPTS } from './prompts';

import { PrismaService } from '@/common/prisma/prisma.service';
import { AI_PROVIDER, AIProvider } from '@/modules/ai-provider/ai-provider.interface';
import { RepositoriesService } from '@/modules/repositories/repositories.service';


const FRAMEWORK_BY_LANGUAGE: Record<string, string> = {
  PYTHON: 'PyTest',
  JAVA: 'JUnit',
  JAVASCRIPT: 'Jest',
  TYPESCRIPT: 'Vitest',
};

@Injectable()
export class AiProductivityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repositories: RepositoriesService,
    @Inject(AI_PROVIDER) private readonly ai: AIProvider,
  ) {}

  async performEditorReview(dto: EditorReviewRequestDto): Promise<EditorReviewResult> {
    const { filePath, fileContent, repoOwner, repoName } = dto;
    const safeContent = fileContent.slice(0, 15000);

    const systemPrompt = `You are Codentra AI's real-time code reviewer.
Analyze the provided source code for:
- Bugs
- Security vulnerabilities
- Performance bottlenecks
- Code quality & readability
- Maintainability issues

Return ONLY a valid JSON object matching this schema:
{
  "summary": "Brief 1-sentence overview of code health",
  "findings": [
    {
      "id": "f1",
      "category": "BUG" | "SECURITY" | "PERFORMANCE" | "QUALITY" | "MAINTAINABILITY",
      "severity": "CRITICAL" | "WARNING" | "SUGGESTION",
      "lineStart": 1,
      "lineEnd": 5,
      "title": "Short title",
      "description": "Clear explanation of the problem",
      "rootCause": "Why this error/vulnerability occurs",
      "suggestedFix": "Complete replacement code snippet"
    }
  ]
}
Rules:
- Be strict and realistic. Do not invent speculative issues.
- If code is clean, return {"summary": "Code is clean and well structured.", "findings": []}.
- Output ONLY JSON. No prose or markdown wrappers.`;

    const userMessage = `Repository: ${repoOwner || 'Unknown'}/${repoName || 'Unknown'}
File Path: ${filePath}

CODE:
\`\`\`
${safeContent}
\`\`\``;

    const rawReply = await this.ai.complete([{ role: 'user', content: userMessage }], systemPrompt);

    try {
      const cleanJson = rawReply.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        filePath,
        summary: parsed.summary || 'Code review completed.',
        findings: Array.isArray(parsed.findings) ? parsed.findings : [],
      };
    } catch (e) {
      return {
        filePath,
        summary: 'Review completed with feedback.',
        findings: [
          {
            id: `f-${Date.now()}`,
            category: 'QUALITY',
            severity: 'SUGGESTION',
            lineStart: 1,
            lineEnd: null,
            title: 'Code Review Summary',
            description: rawReply,
          },
        ],
      };
    }
  }

  async performErrorAnalysis(dto: EditorReviewRequestDto): Promise<EditorReviewResult> {
    const { filePath, fileContent, errorMessages } = dto;
    const safeContent = fileContent.slice(0, 15000);
    const errorsList = errorMessages?.join('\n') || 'General diagnostic inspection requested.';

    const systemPrompt = `You are Codentra AI's error diagnostics engineer.
Analyze the provided code and reported editor diagnostic errors.

Return ONLY a valid JSON object matching this schema:
{
  "summary": "Brief explanation of the diagnostic errors",
  "findings": [
    {
      "id": "err1",
      "category": "BUG",
      "severity": "CRITICAL" | "WARNING" | "SUGGESTION",
      "lineStart": 1,
      "lineEnd": null,
      "title": "Error summary",
      "description": "Detailed explanation of why this error occurs",
      "rootCause": "Root cause explanation",
      "suggestedFix": "Fixed code snippet"
    }
  ]
}
Rules:
- Output ONLY JSON. No prose or markdown wrappers.`;

    const userMessage = `File: ${filePath}

REPORTED DIAGNOSTIC ERRORS:
${errorsList}

CODE:
\`\`\`
${safeContent}
\`\`\``;

    const rawReply = await this.ai.complete([{ role: 'user', content: userMessage }], systemPrompt);

    try {
      const cleanJson = rawReply.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        filePath,
        summary: parsed.summary || 'Error analysis completed.',
        findings: Array.isArray(parsed.findings) ? parsed.findings : [],
      };
    } catch (e) {
      return {
        filePath,
        summary: 'Error analysis completed.',
        findings: [],
      };
    }
  }

  async handleEditorPrompt(dto: EditorAiPromptDto): Promise<EditorAiResponse> {
    const { action, userPrompt, filePath, fileContent, selectedCode, repoOwner, repoName, branch } = dto;

    const safeContent = fileContent ? fileContent.slice(0, 15000) : '';
    const safeSelection = selectedCode ? selectedCode.slice(0, 8000) : '';

    let actionInstruction = '';
    switch (action) {
      case 'EXPLAIN':
        actionInstruction = 'Explain the selected code (or current file) clearly, highlighting key logic, inputs, and outputs.';
        break;
      case 'FIND_ERRORS':
        actionInstruction = 'Analyze the code for potential bugs, logical errors, edge cases, or security vulnerabilities.';
        break;
      case 'FIX':
        actionInstruction = 'Provide a fixed version of the code that resolves bugs or errors. Output the updated code block clearly.';
        break;
      case 'OPTIMIZE':
        actionInstruction = 'Optimize the code for performance, readability, and modern best practices. Output the updated code block.';
        break;
      case 'REVIEW':
        actionInstruction = 'Provide a comprehensive code review covering maintainability, type safety, security, and performance.';
        break;
      case 'GENERATE_TESTS':
        actionInstruction = 'Generate complete, production-grade unit tests for this code.';
        break;
      default:
        actionInstruction = userPrompt || 'Assist with the provided code.';
        break;
    }

    const systemPrompt = `You are Codentra AI, an expert-level software engineer integrated directly into the browser IDE.
You assist developers with explaining code, finding errors, refactoring, writing tests, and optimizing code.

INSTRUCTIONS:
1. Always be concise, technical, and precise.
2. If suggesting code modifications or fixes, provide the proposed updated code inside a \`\`\`PROPOSED_CODE\`\`\` block (or standard code block), followed by a brief explanation of changes.
3. If no code changes are needed (e.g. for explanation or review), provide clear markdown formatted explanations.`;

    const userMessage = `Repository Context: ${repoOwner || 'Unknown'}/${repoName || 'Unknown'} (${branch || 'default'})
File Path: ${filePath || 'Untitled'}

${safeSelection ? `SELECTED CODE SNIPPET:\n\`\`\`\n${safeSelection}\n\`\`\`\n` : ''}
${safeContent ? `FULL FILE CONTENT:\n\`\`\`\n${safeContent}\n\`\`\`\n` : ''}

USER INSTRUCTION:
${userPrompt ? `${userPrompt}\n` : ''}
TASK: ${actionInstruction}`;

    const reply = await this.ai.complete([{ role: 'user', content: userMessage }], systemPrompt);

    const proposedCodeMatch = reply.match(/```(?:PROPOSED_CODE|[a-zA-Z0-9_-]+)?\n([\s\S]*?)```/);
    const suggestedCode = proposedCodeMatch && proposedCodeMatch[1] ? proposedCodeMatch[1].trim() : undefined;
    const hasDiffProposal = Boolean(
      suggestedCode &&
        (action === 'FIX' ||
          action === 'OPTIMIZE' ||
          action === 'GENERATE_TESTS' ||
          (userPrompt && userPrompt.toLowerCase().includes('change'))),
    );

    return {
      replyText: reply,
      suggestedCode,
      originalCode: safeSelection || safeContent,
      hasDiffProposal,
    };
  }

  async generateReadme(userId: string, repositoryId: string) {
    await this.repositories.findOne(userId, repositoryId);
    const context = await this.prisma.aIContext.findUnique({ where: { repositoryId } });
    const prompt = PROMPTS.readme(context?.summary ?? 'No summary available', JSON.stringify(context?.techStack ?? {}));
    return this.runAndStore(repositoryId, 'README', await this.call(prompt));
  }

  async generateTests(userId: string, repositoryId: string, fileId: string, framework?: string) {
    const file = await this.repositories.getFile(userId, repositoryId, fileId);
    const resolvedFramework = framework ?? FRAMEWORK_BY_LANGUAGE[file.language] ?? 'Jest';
    const prompt = PROMPTS.testGenerator(file.path, file.content ?? '', resolvedFramework);
    return this.runAndStore(repositoryId, 'UNIT_TEST', await this.call(prompt), file.path);
  }

  async explainCode(userId: string, repositoryId: string, fileId: string) {
    const file = await this.repositories.getFile(userId, repositoryId, fileId);
    const prompt = PROMPTS.codeExplainer(file.path, file.content ?? '');
    return this.runAndStore(repositoryId, 'CODE_EXPLANATION', await this.call(prompt), file.path);
  }

  async explainArchitecture(userId: string, repositoryId: string) {
    await this.repositories.findOne(userId, repositoryId);
    const context = await this.prisma.aIContext.findUnique({ where: { repositoryId } });
    const prompt = PROMPTS.architectureExplainer(
      context?.summary ?? '',
      JSON.stringify(context?.architecture ?? {}),
    );
    return this.runAndStore(repositoryId, 'ARCHITECTURE_EXPLANATION', await this.call(prompt));
  }

  async explainSql(query: string) {
    // Not repository-scoped — a standalone utility, so no access check needed beyond auth.
    return this.call(PROMPTS.sqlExplainer(query));
  }

  async explainAlgorithm(code: string) {
    return this.call(PROMPTS.algorithmExplainer(code));
  }

  async debugCode(code: string, errorContext?: string) {
    return this.call(PROMPTS.debuggingAssistant(code, errorContext));
  }

  async refactorFile(userId: string, repositoryId: string, fileId: string) {
    const file = await this.repositories.getFile(userId, repositoryId, fileId);
    const prompt = PROMPTS.refactoringEngine(file.path, file.content ?? '');
    return this.runAndStore(repositoryId, 'REFACTOR_SUGGESTION', await this.call(prompt), file.path);
  }

  async generateCommitMessage(diff: string) {
    return this.call(PROMPTS.commitMessageGenerator(diff));
  }

  async generateDiagram(userId: string, repositoryId: string) {
    await this.repositories.findOne(userId, repositoryId);
    const context = await this.prisma.aIContext.findUnique({ where: { repositoryId } });
    const prompt = PROMPTS.diagramGenerator(context?.summary ?? '', JSON.stringify(context?.architecture ?? {}));
    return this.runAndStore(repositoryId, 'DIAGRAM', await this.call(prompt));
  }

  async listArtifacts(userId: string, repositoryId: string, type?: ArtifactType) {
    await this.repositories.findOne(userId, repositoryId);
    return this.prisma.generatedArtifact.findMany({
      where: { repositoryId, ...(type ? { type } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  private call(prompt: { system: string; user: string }): Promise<string> {
    return this.ai.complete([{ role: 'user', content: prompt.user }], prompt.system);
  }

  private async runAndStore(repositoryId: string, type: ArtifactType, content: string, targetPath?: string) {
    return this.prisma.generatedArtifact.create({ data: { repositoryId, type, content, targetPath } });
  }
}
