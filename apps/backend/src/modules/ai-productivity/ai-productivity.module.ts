import { Module } from '@nestjs/common';

import { AiProductivityController, AiUtilitiesController } from './ai-productivity.controller';
import { AiProductivityService } from './ai-productivity.service';

import { AIProviderModule } from '@/modules/ai-provider/ai-provider.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { RepositoriesModule } from '@/modules/repositories/repositories.module';


@Module({
  imports: [AuthModule, RepositoriesModule, AIProviderModule],
  controllers: [AiProductivityController, AiUtilitiesController],
  providers: [AiProductivityService],
})
export class AiProductivityModule {}
