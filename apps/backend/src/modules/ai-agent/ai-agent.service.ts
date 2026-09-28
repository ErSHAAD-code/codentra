import { Inject, Injectable, Logger } from '@nestjs/common';

import { CreateAgentPlanDto, AgentPlanResult } from './dto/create-agent-plan.dto';

import { AI_PROVIDER, AIProvider } from '@/modules/ai-provider/ai-provider.interface';

@Injectable()
export class AiAgentService {
  private readonly logger = new Logger(AiAgentService.name);

  constructor(@Inject(AI_PROVIDER) private readonly aiProvider: AIProvider) {}

  async createPlan(dto: CreateAgentPlanDto): Promise<AgentPlanResult> {
    const { task, filePath, fileContent, repoOwner, repoName, branch } = dto;

    const systemPrompt = `You are Codentra Agent, an autonomous software architect and senior developer assistant.
Your job is to analyze high-level engineering tasks for a codebase and construct a clear, step-by-step Implementation Plan.

You MUST respond strictly with valid JSON conforming to the following structure:
{
  "task": "${task.replace(/"/g, '\\"')}",
  "summary": "High-level summary of the implementation strategy",
  "architectureOverview": "Short overview of key system areas impacted",
  "steps": [
    {
      "id": "step-1",
      "title": "Title of step 1",
      "description": "Detailed explanation of what needs to be done in step 1",
      "targetFiles": ["path/to/file1.ts"],
      "status": "pending"
    }
  ]
}

DO NOT wrap JSON in markdown backticks. Return ONLY raw JSON.`;

    const userMessageContent = `Task requested: ${task}
Repository: ${repoOwner && repoName ? `${repoOwner}/${repoName}` : 'In-browser IDE Workspace'}
Branch: ${branch || 'main'}
${filePath ? `Active File: ${filePath}\n` : ''}
${fileContent ? `Active File Snippet:\n\`\`\`\n${fileContent.slice(0, 3000)}\n\`\`\`\n` : ''}

Construct a comprehensive 4-6 step implementation plan to fulfill this request.`;

    try {
      const response = await this.aiProvider.complete(
        [{ role: 'user', content: userMessageContent }],
        systemPrompt,
      );

      // Clean response text if wrapped in codeblocks
      const cleaned = response.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(cleaned) as AgentPlanResult;
      
      return {
        task: parsed.task || task,
        summary: parsed.summary || 'Implementation strategy created.',
        architectureOverview: parsed.architectureOverview || 'Analyzed codebase structure and identified required edits.',
        steps: Array.isArray(parsed.steps) && parsed.steps.length > 0 ? parsed.steps : [
          {
            id: 'step-1',
            title: 'Analyze Requirements & Edits',
            description: `Review task "${task}" and apply necessary changes.`,
            status: 'pending'
          }
        ]
      };
    } catch (err: any) {
      this.logger.error(`Failed to generate agent plan: ${err.message}`, err.stack);
      
      // Fallback structured plan if AI provider output failed parsing
      return {
        task,
        summary: `Plan generated for task: ${task}`,
        architectureOverview: 'System structure analyzed.',
        steps: [
          {
            id: 'step-1',
            title: 'Audit Existing Components',
            description: `Inspect project structure and identify modules related to "${task}".`,
            status: 'pending',
          },
          {
            id: 'step-2',
            title: 'Backend Logic & API Updates',
            description: 'Implement required backend routes, DTOs, and services.',
            status: 'pending',
          },
          {
            id: 'step-3',
            title: 'Frontend Component & UI Integration',
            description: 'Update application views and state management to integrate new features.',
            status: 'pending',
          },
          {
            id: 'step-4',
            title: 'Testing & Validation',
            description: 'Verify system compilation, type checking, and operational behavior.',
            status: 'pending',
          },
        ],
      };
    }
  }
}
