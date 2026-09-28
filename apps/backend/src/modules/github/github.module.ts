import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';
import { ProjectsModule } from '@/modules/projects/projects.module';

import { GithubClient } from './github-client';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';

@Module({
  imports: [AuthModule, ProjectsModule],
  controllers: [GithubController],
  providers: [GithubClient, GithubService],
  exports: [GithubService, GithubClient],
})
export class GithubModule {}
