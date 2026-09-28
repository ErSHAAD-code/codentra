import { Controller, Get, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { SessionGuard } from '@/modules/auth/guards/session.guard';

import { MAX_UPLOAD_SIZE_BYTES } from './upload-validation';
import { UploadsService } from './uploads.service';

@Controller('repositories/:repositoryId/uploads')
@UseGuards(SessionGuard)
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_SIZE_BYTES } }))
  async upload(
    @CurrentUser() user: User,
    @Param('repositoryId') repositoryId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('kind') kind: 'zip' | 'single-file' = 'zip',
  ) {
    return this.uploads.handleUpload(user.id, repositoryId, file, kind);
  }

  @Get('status')
  status(@CurrentUser() user: User, @Param('repositoryId') repositoryId: string) {
    return this.uploads.getStatus(user.id, repositoryId);
  }
}
