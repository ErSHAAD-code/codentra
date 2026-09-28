import { Module } from '@nestjs/common';

import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

import { AuthModule } from '@/modules/auth/auth.module';
import { RepositoriesModule } from '@/modules/repositories/repositories.module';


@Module({
  imports: [AuthModule, RepositoriesModule],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}
