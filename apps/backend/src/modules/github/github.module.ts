import { Module } from '@nestjs/common';


import { GithubClient } from './github-client';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';

import { AuthModule } from '@/modules/auth/auth.module';
import { ProjectsModule } from '@/modules/projects/projects.module';

@Module({
  imports: [AuthModule, ProjectsModule],
  controllers: [GithubController],
  providers: [GithubClient, GithubService],
  exports: [GithubService, GithubClient],
})
export class GithubModule {}
