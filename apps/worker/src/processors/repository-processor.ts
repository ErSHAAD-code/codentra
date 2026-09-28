import AdmZip from 'adm-zip';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

import { fetchGithubTarballEntries } from '../github-tarball';
import { detectLanguage } from '../language-map';
import { parseFile } from '../parser';
import { RepositoryProcessingJob } from '../types';

const MAX_INLINE_FILE_SIZE = 500 * 1024; // 500KB — larger files skip content storage/parsing for now (Phase 7 moves this to object storage)

export async function processRepository(prisma: PrismaClient, job: RepositoryProcessingJob): Promise<void> {
  const { repositoryId, storagePath, archiveType } = job;

  try {
    let entries: Array<{ entryName: string; getData: () => Buffer }>;

    if (archiveType === 'zip') {
      entries = new AdmZip(storagePath!).getEntries().filter((e) => !e.isDirectory);
    } else if (archiveType === 'github') {
      if (!job.github) throw new Error('Missing GitHub download info on job');
      entries = await fetchGithubTarballEntries(job.github.url, job.github.token);
    } else {
      entries = [{ entryName: path.basename(storagePath!), getData: () => fs.readFileSync(storagePath!) }];
    }

    const folderPaths = new Set<string>();
    const languageTotals = new Map<string, { fileCount: number; lineCount: number }>();

    for (const entry of entries) {
      const filePath = entry.entryName;
      const content = entry.getData().toString('utf-8');
      const language = detectLanguage(filePath);
      const parsed = parseFile(content, language);

      // Register every parent folder so the repository tree is complete
      const parts = filePath.split('/').slice(0, -1);
      for (let i = 0; i < parts.length; i++) {
        folderPaths.add(parts.slice(0, i + 1).join('/'));
      }

      await prisma.repositoryFile.upsert({
        where: { repositoryId_path: { repositoryId, path: filePath } },
        update: {
          language: language as never,
          sizeBytes: content.length,
          lineCount: parsed.lineCount,
          content: content.length <= MAX_INLINE_FILE_SIZE ? content : null,
          imports: parsed.imports,
          functions: parsed.functions,
          classes: parsed.classes,
        },
        create: {
          repositoryId,
          path: filePath,
          extension: path.extname(filePath),
          language: language as never,
          sizeBytes: content.length,
          lineCount: parsed.lineCount,
          content: content.length <= MAX_INLINE_FILE_SIZE ? content : null,
          imports: parsed.imports,
          functions: parsed.functions,
          classes: parsed.classes,
        },
      });

      const totals = languageTotals.get(language) ?? { fileCount: 0, lineCount: 0 };
      totals.fileCount += 1;
      totals.lineCount += parsed.lineCount;
      languageTotals.set(language, totals);
    }

    for (const folderPath of folderPaths) {
      const parentPath = folderPath.includes('/') ? folderPath.split('/').slice(0, -1).join('/') : null;
      await prisma.repositoryFolder.upsert({
        where: { repositoryId_path: { repositoryId, path: folderPath } },
        update: {},
        create: { repositoryId, path: folderPath, parentPath },
      });
    }

    const totalLines = [...languageTotals.values()].reduce((sum, t) => sum + t.lineCount, 0);
    for (const [language, totals] of languageTotals.entries()) {
      await prisma.languageStatistic.upsert({
        where: { repositoryId_language: { repositoryId, language: language as never } },
        update: { ...totals, percentage: totalLines ? (totals.lineCount / totalLines) * 100 : 0 },
        create: {
          repositoryId,
          language: language as never,
          ...totals,
          percentage: totalLines ? (totals.lineCount / totalLines) * 100 : 0,
        },
      });
    }

    await buildAIContext(prisma, repositoryId);
    await prisma.repository.update({ where: { id: repositoryId }, data: { status: 'READY' } });
    await prisma.upload.update({ where: { id: job.uploadId }, data: { status: 'COMPLETED', completedAt: new Date() } });
  } catch (error) {
    await prisma.repository.update({ where: { id: repositoryId }, data: { status: 'FAILED' } });
    await prisma.upload.update({
      where: { id: job.uploadId },
      data: { status: 'FAILED', errorMessage: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error; // let BullMQ's retry/backoff handle it
  }
}

/** Mirrors apps/backend's ContextBuilderService — kept in the worker since
 * context should be rebuilt as the last step of processing, in the same
 * process that just parsed everything, rather than a second round-trip. */
async function buildAIContext(prisma: PrismaClient, repositoryId: string): Promise<void> {
  const files = await prisma.repositoryFile.findMany({ where: { repositoryId } });
  const folders = await prisma.repositoryFolder.findMany({ where: { repositoryId } });

  const byLanguage = new Map<string, number>();
  for (const f of files) byLanguage.set(f.language, (byLanguage.get(f.language) ?? 0) + f.lineCount);
  const sorted = [...byLanguage.entries()].filter(([l]) => l !== 'UNKNOWN').sort((a, b) => b[1] - a[1]);
  const primary = sorted[0]?.[0] ?? 'UNKNOWN';

  const functionCount = files.reduce((sum: number, f: any) => sum + (Array.isArray(f.functions) ? f.functions.length : 0), 0);
  const classCount = files.reduce((sum: number, f: any) => sum + (Array.isArray(f.classes) ? f.classes.length : 0), 0);

  const summary =
    `Repository with ${files.length} files across ${folders.length} folders. ` +
    `Primary language: ${primary}. ${functionCount} functions and ${classCount} classes detected.`;

  await prisma.aIContext.upsert({
    where: { repositoryId },
    update: { summary, techStack: { primaryLanguage: primary }, architecture: { folderCount: folders.length, fileCount: files.length }, generatedAt: new Date() },
    create: { repositoryId, summary, techStack: { primaryLanguage: primary }, architecture: { folderCount: folders.length, fileCount: files.length } },
  });
}
