import { Module } from '@nestjs/common';

import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';

import { AuthModule } from '@/modules/auth/auth.module';
import { RepositoriesModule } from '@/modules/repositories/repositories.module';


@Module({
  imports: [AuthModule, RepositoriesModule],
  controllers: [AnalysisController],
  providers: [AnalysisService],
})
export class AnalysisModule {}
