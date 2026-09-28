import 'dotenv/config';

import { PrismaClient } from '@prisma/client';
import { Worker } from 'bullmq';

import { processAnalysis } from './processors/analysis-processor';
import { processRepository } from './processors/repository-processor';
import { AnalysisJob, RepositoryProcessingJob } from './types';

const prisma = new PrismaClient();
const connection = { url: process.env.REDIS_URL ?? 'redis://localhost:6379' } as never;

const repositoryWorker = new Worker<RepositoryProcessingJob>(
  'repository-processing',
  async (job) => {
    // eslint-disable-next-line no-console
    console.log(`Processing repository ${job.data.repositoryId} (upload ${job.data.uploadId})`);
    await processRepository(prisma, job.data);
  },
  { connection, concurrency: 3 },
);

const analysisWorker = new Worker<AnalysisJob>(
  'analysis',
  async (job) => {
    // eslint-disable-next-line no-console
    console.log(`Running analysis ${job.data.analysisId} for repository ${job.data.repositoryId}`);
    await processAnalysis(prisma, job.data);
  },
  { connection, concurrency: 2 }, // lower concurrency — AI calls are the expensive resource here
);

for (const worker of [repositoryWorker, analysisWorker]) {
  worker.on('completed', (job) => console.log(`[${worker.name}] Job ${job.id} completed`));
  worker.on('failed', (job, error) => console.error(`[${worker.name}] Job ${job?.id} failed:`, error.message));
}

process.on('SIGTERM', async () => {
  await Promise.all([repositoryWorker.close(), analysisWorker.close()]);
  await prisma.$disconnect();
});
