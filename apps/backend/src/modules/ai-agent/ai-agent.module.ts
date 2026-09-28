import { Module } from '@nestjs/common';

import { AIProviderModule } from '@/modules/ai-provider/ai-provider.module';
import { GithubModule } from '@/modules/github/github.module';

import { AgentChangesetService } from './agent-changeset.service';
import { AgentOrchestratorService } from './agent-orchestrator.service';
import { AiAgentController } from './ai-agent.controller';
import { AiAgentService } from './ai-agent.service';
import { AgentValidationService } from './tools/agent-validation.service';
import { RepositoryToolsService } from './tools/repository-tools.service';

@Module({
  imports: [AIProviderModule, GithubModule],
  controllers: [AiAgentController],
  providers: [
    AiAgentService,
    AgentOrchestratorService,
    RepositoryToolsService,
    AgentChangesetService,
    AgentValidationService,
  ],
  exports: [AiAgentService, AgentOrchestratorService, AgentChangesetService, AgentValidationService],
})
export class AiAgentModule {}
