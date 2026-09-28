import { Module } from '@nestjs/common';

import { RepositoriesController } from './repositories.controller';
import { RepositoriesService } from './repositories.service';

import { AuthModule } from '@/modules/auth/auth.module';
import { ProjectsModule } from '@/modules/projects/projects.module';


@Module({
  imports: [AuthModule, ProjectsModule],
  controllers: [RepositoriesController],
  providers: [RepositoriesService],
  exports: [RepositoriesService],
})
export class RepositoriesModule {}
