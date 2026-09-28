import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

import { Injectable, NotFoundException } from '@nestjs/common';

import { assertValidUpload, sanitizeFileName } from './upload-validation';

import { PrismaService } from '@/common/prisma/prisma.service';
import { QueueService } from '@/common/queue/queue.service';
import { RepositoriesService } from '@/modules/repositories/repositories.service';


// Local disk in development. Swapped for an object-storage abstraction
// (Supabase/S3) behind the same interface in Phase 7 — nothing above this
// service needs to change when that happens.
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'tmp', 'uploads');

@Injectable()
export class UploadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repositories: RepositoriesService,
    private readonly queue: QueueService,
  ) {}

  async handleUpload(
    userId: string,
    repositoryId: string,
    file: { originalname: string; size: number; buffer: Buffer },
    kind: 'zip' | 'single-file',
  ) {
    const repository = await this.repositories.findOne(userId, repositoryId); // asserts access
    if (!repository) throw new NotFoundException('Repository not found');

    assertValidUpload(file.originalname, file.size, kind);
    const safeName = sanitizeFileName(file.originalname);

    await mkdir(UPLOAD_DIR, { recursive: true });
    const storedFileName = `${randomUUID()}-${safeName}`;
    const storagePath = path.join(UPLOAD_DIR, storedFileName);
    await writeFile(storagePath, file.buffer);

    const upload = await this.prisma.upload.create({
      data: {
        repositoryId,
        fileName: safeName,
        sizeBytes: file.size,
        status: 'PROCESSING',
      },
    });

    await this.repositories.updateStatus(repositoryId, 'PROCESSING');

    await this.queue.enqueueRepositoryProcessing({
      repositoryId,
      uploadId: upload.id,
      storagePath,
      archiveType: kind,
    });

    return upload;
  }

  async getStatus(userId: string, repositoryId: string) {
    await this.repositories.findOne(userId, repositoryId); // asserts access
    return this.prisma.upload.findMany({
      where: { repositoryId },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });
  }
}
