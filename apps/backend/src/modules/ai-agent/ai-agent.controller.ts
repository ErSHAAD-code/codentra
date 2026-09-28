import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Response } from 'express';


import { AgentChangesetService } from './agent-changeset.service';
import { AgentOrchestratorService } from './agent-orchestrator.service';
import { AiAgentService } from './ai-agent.service';
import { AgentChangeset, AgentFileChange } from './dto/agent-changeset.dto';
import { CreateAgentPlanDto, AgentPlanResult } from './dto/create-agent-plan.dto';
import { RunAgentDto } from './dto/run-agent.dto';
import { AgentValidationService } from './tools/agent-validation.service';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { MultiModelProviderService } from '@/modules/ai-provider/multi-model-provider.service';
import { SessionGuard } from '@/modules/auth/guards/session.guard';

@Controller('api/v1/ai/agent')
@UseGuards(SessionGuard)
export class AiAgentController {
  constructor(
    private readonly aiAgentService: AiAgentService,
    private readonly orchestrator: AgentOrchestratorService,
    private readonly changesetService: AgentChangesetService,
    private readonly validationService: AgentValidationService,
    private readonly multiModelService: MultiModelProviderService,
  ) {}

  /** Phase 5 — Get available configured AI models */
  @Get('models')
  getModels() {
    return this.multiModelService.getAvailableModels();
  }

  /** Phase 1 compat — simple non-streaming plan generation */
  @Post('plan')
  async createPlan(@Body() dto: CreateAgentPlanDto): Promise<AgentPlanResult> {
    return this.aiAgentService.createPlan(dto);
  }

  /**
   * Phase 2 & Phase 3 — Streaming agent run via Server-Sent Events.
   */
  @Post('run')
  async streamRun(
    @CurrentUser() user: User,
    @Body() dto: RunAgentDto,
    @Res() res: Response,
  ): Promise<void> {
    const runId = `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    AiAgentController.activeRuns.set(runId, false);
    res.write(`data: ${JSON.stringify({ type: 'run_started', runId })}\n\n`);

    try {
      for await (const event of this.orchestrator.run(user.id, dto, runId)) {
        if (AiAgentController.activeRuns.get(runId) === true) {
          res.write(`data: ${JSON.stringify({ type: 'cancelled', message: 'Cancelled by user.' })}\n\n`);
          break;
        }

        res.write(`data: ${JSON.stringify(event)}\n\n`);

        if (event.type === 'plan_ready' || event.type === 'error' || event.type === 'cancelled') {
          break;
        }
      }
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: err?.message ?? 'Agent error' })}\n\n`);
    } finally {
      AiAgentController.activeRuns.delete(runId);
      res.end();
    }
  }

  @Delete('run/:runId')
  @HttpCode(204)
  cancelRun(@Param('runId') runId: string): void {
    if (AiAgentController.activeRuns.has(runId)) {
      AiAgentController.activeRuns.set(runId, true);
    }
  }

  // ── Phase 3 Changeset Endpoints ─────────────────────────────────

  @Get('changeset/:id')
  getChangeset(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): AgentChangeset {
    return this.changesetService.getChangeset(id, user.id);
  }

  @Patch('changeset/:id/decision')
  updateDecision(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: { changeId: string; decision: 'accepted' | 'rejected' },
  ): AgentFileChange {
    return this.changesetService.updateChangeDecision(
      id,
      user.id,
      body.changeId,
      body.decision,
    );
  }

  @Post('changeset/:id/accept-all')
  acceptAll(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): AgentChangeset {
    return this.changesetService.acceptAll(id, user.id);
  }

  @Post('changeset/:id/reject-all')
  rejectAll(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): AgentChangeset {
    return this.changesetService.rejectAll(id, user.id);
  }

  // ── Phase 4 Controlled Validation Endpoint ───────────────────────

  @Post('validate')
  async runValidation(
    @Body() dto: { command: 'typecheck' | 'lint' | 'test' | 'build'; files?: string[] },
  ) {
    return this.validationService.runValidation(dto.command, dto.files);
  }

  private static readonly activeRuns = new Map<string, boolean>();
}
