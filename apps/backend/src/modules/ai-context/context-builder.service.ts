import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { LanguageDetectorService } from '@/modules/language-detector/language-detector.service';

/**
 * Builds the structured context every future AI feature reads from
 * (chat now; review/docs/tests in Phase 3/6) instead of each feature
 * re-deriving it from raw files. Output is intentionally compact and
 * structured — optimized for token efficiency when it's later placed
 * into an LLM prompt, not for human reading.
 */
@Injectable()
export class ContextBuilderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly languageDetector: LanguageDetectorService,
  ) {}

  async buildForRepository(repositoryId: string) {
    const [files, folders, languageStats] = await Promise.all([
      this.prisma.repositoryFile.findMany({ where: { repositoryId } }),
      this.prisma.repositoryFolder.findMany({ where: { repositoryId } }),
      this.prisma.languageStatistic.findMany({ where: { repositoryId } }),
    ]);

    const { primary, secondary } = this.languageDetector.summarize(files);
    const rootFileNames = files.filter((f) => !f.path.includes('/')).map((f) => f.path.split('/').pop() ?? '');
    const frameworks = this.languageDetector.detectFrameworks(rootFileNames);

    const functionCount = files.reduce((sum, f) => sum + (Array.isArray(f.functions) ? f.functions.length : 0), 0);
    const classCount = files.reduce((sum, f) => sum + (Array.isArray(f.classes) ? f.classes.length : 0), 0);

    const techStack = { primaryLanguage: primary, secondaryLanguages: secondary, frameworks };
    const architecture = {
      folderCount: folders.length,
      fileCount: files.length,
      topLevelFolders: folders.filter((f) => !f.parentPath).map((f) => f.path),
    };
    const summary =
      `Repository with ${files.length} files across ${folders.length} folders. ` +
      `Primary language: ${primary}. ${functionCount} functions and ${classCount} classes detected.`;

    return this.prisma.aIContext.upsert({
      where: { repositoryId },
      update: { summary, techStack, architecture, generatedAt: new Date() },
      create: { repositoryId, summary, techStack, architecture },
    });
  }
}
