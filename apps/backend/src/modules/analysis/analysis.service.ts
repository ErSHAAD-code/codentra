import { Injectable } from '@nestjs/common';

import { buildPaginatedResult, PaginationQueryDto } from '@/common/pagination/pagination.dto';
import { PrismaService } from '@/common/prisma/prisma.service';
import { QueueService } from '@/common/queue/queue.service';
import { RepositoriesService } from '@/modules/repositories/repositories.service';

@Injectable()
export class AnalysisService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repositories: RepositoriesService,
    private readonly queue: QueueService,
  ) {}

  async listAllForUser(userId: string) {
    return this.prisma.analysis.findMany({
      where: { repository: { project: { workspace: { organization: { members: { some: { userId } } } } } } },
      orderBy: { createdAt: 'desc' },
      include: {
        repository: { select: { id: true, name: true } },
        _count: { select: { findings: true } },
      },
      take: 50,
    });
  }

  async getDashboardStats(userId: string) {
    const accessFilter = { repository: { project: { workspace: { organization: { members: { some: { userId } } } } } } };

    const [repositoriesCount, openIssuesCount, securityAlertsCount, completedAnalyses] = await Promise.all([
      this.prisma.repository.count({
        where: { project: { workspace: { organization: { members: { some: { userId } } } } } },
      }),
      this.prisma.finding.count({ where: { status: 'OPEN', analysis: accessFilter } }),
      this.prisma.finding.count({ where: { status: 'OPEN', category: 'SECURITY', analysis: accessFilter } }),
      this.prisma.analysis.findMany({
        where: { status: 'COMPLETED', overallScore: { not: null }, ...accessFilter },
        select: { overallScore: true },
      }),
    ]);

    const avgQualityScore = completedAnalyses.length
      ? Math.round(completedAnalyses.reduce((sum, a) => sum + (a.overallScore ?? 0), 0) / completedAnalyses.length)
      : null;

    return { repositoriesCount, openIssuesCount, securityAlertsCount, avgQualityScore };
  }

  async triggerAnalysis(userId: string, repositoryId: string) {
    await this.repositories.findOne(userId, repositoryId); // asserts access

    const analysis = await this.prisma.analysis.create({
      data: { repositoryId, triggeredBy: userId, status: 'QUEUED' },
    });

    await this.queue.enqueueAnalysis({ analysisId: analysis.id, repositoryId });
    return analysis;
  }

  async getAnalysis(userId: string, analysisId: string) {
    const analysis = await this.prisma.analysis.findUniqueOrThrow({
      where: { id: analysisId },
      include: { findings: { orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }], take: 50 } },
    });
    await this.repositories.findOne(userId, analysis.repositoryId); // asserts access
    return analysis;
  }

  /** Cursor-paginated findings for analyses with more than the 50-item
   * default fetched by getAnalysis() above — the UI switches to this
   * once a "load more" is needed rather than fetching everything upfront. */
  async getFindingsPage(userId: string, analysisId: string, query: PaginationQueryDto) {
    const analysis = await this.prisma.analysis.findUniqueOrThrow({ where: { id: analysisId } });
    await this.repositories.findOne(userId, analysis.repositoryId);

    const findings = await this.prisma.finding.findMany({
      where: { analysisId },
      orderBy: { createdAt: 'desc' },
      take: query.limit + 1, // fetch one extra to know if there's a next page
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    });

    return buildPaginatedResult(findings, query.limit);
  }

  async listAnalysesForRepository(userId: string, repositoryId: string) {
    await this.repositories.findOne(userId, repositoryId);
    return this.prisma.analysis.findMany({
      where: { repositoryId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateFindingStatus(userId: string, findingId: string, status: 'OPEN' | 'RESOLVED' | 'IGNORED') {
    const finding = await this.prisma.finding.findUniqueOrThrow({
      where: { id: findingId },
      include: { analysis: true },
    });
    await this.repositories.findOne(userId, finding.analysis.repositoryId); // asserts access
    return this.prisma.finding.update({ where: { id: findingId }, data: { status } });
  }
}
