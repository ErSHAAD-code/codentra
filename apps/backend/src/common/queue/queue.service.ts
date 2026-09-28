import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';

import { AnalysisJob, QUEUE_NAMES, RepositoryProcessingJob } from './queue.types';

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly repositoryQueue = new Queue<RepositoryProcessingJob>(QUEUE_NAMES.REPOSITORY_PROCESSING, {
    connection: { url: process.env.REDIS_URL ?? 'redis://localhost:6379' } as never,
  });

  private readonly analysisQueue = new Queue<AnalysisJob>(QUEUE_NAMES.ANALYSIS, {
    connection: { url: process.env.REDIS_URL ?? 'redis://localhost:6379' } as never,
  });

  async enqueueRepositoryProcessing(job: RepositoryProcessingJob) {
    return this.repositoryQueue.add('process', job, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
  }

  async enqueueAnalysis(job: AnalysisJob) {
    return this.analysisQueue.add('analyze', job, {
      attempts: 2, // AI calls are expensive — fewer automatic retries than parsing jobs
      backoff: { type: 'exponential', delay: 10000 },
    });
  }

  async onModuleDestroy() {
    await this.repositoryQueue.close();
    await this.analysisQueue.close();
  }
}
