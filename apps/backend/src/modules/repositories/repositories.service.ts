import { Injectable, NotFoundException } from '@nestjs/common';

import { CacheService } from '@/common/cache/cache.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ProjectsService } from '@/modules/projects/projects.service';

import { CreateRepositoryDto } from './dto/repository.dto';

@Injectable()
export class RepositoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
    private readonly cache: CacheService,
  ) {}

  async create(userId: string, dto: CreateRepositoryDto) {
    await this.projects.findOne(userId, dto.projectId); // asserts access, throws if none

    return this.prisma.repository.create({
      data: {
        projectId: dto.projectId,
        name: dto.name,
        type: dto.type,
        githubUrl: dto.githubUrl,
        status: 'PENDING',
      },
    });
  }

  async findAllForProject(userId: string, projectId: string) {
    await this.projects.findOne(userId, projectId);
    return this.prisma.repository.findMany({
      where: { projectId },
      orderBy: { updatedAt: 'desc' },
      include: { languageStats: true },
    });
  }

  async findOne(userId: string, repositoryId: string) {
    const repository = await this.prisma.repository.findUnique({ where: { id: repositoryId } });
    if (!repository) throw new NotFoundException('Repository not found');
    await this.projects.findOne(userId, repository.projectId); // asserts access
    return repository;
  }

  async findAllForUser(userId: string) {
    return this.prisma.repository.findMany({
      where: { project: { workspace: { organization: { members: { some: { userId } } } } } },
      orderBy: { updatedAt: 'desc' },
      include: { project: { select: { name: true } } },
    });
  }

  private async getOrCreateDefaultProject(userId: string) {
    const membership = await this.prisma.organizationMember.findFirst({
      where: { userId },
      include: { organization: { include: { workspaces: true } } },
    });
    if (!membership) throw new NotFoundException('No organization found for this user');

    const workspace = membership.organization.workspaces[0];
    if (!workspace) throw new NotFoundException('No workspace found for this organization');

    return this.prisma.project.upsert({
      where: { workspaceId_slug: { workspaceId: workspace.id, slug: 'quick-start' } },
      update: {},
      create: { workspaceId: workspace.id, name: 'Quick Start', slug: 'quick-start' },
    });
  }

  /** Creates a repository shell (PENDING, no content yet) ready to receive
   * an upload — used by the Repositories page's "New Repository" flow so
   * users don't need to create a Project first through separate UI. */
  async createForUpload(userId: string, name: string) {
    const project = await this.getOrCreateDefaultProject(userId);
    return this.prisma.repository.create({
      data: { projectId: project.id, name, type: 'ZIP_UPLOAD', status: 'PENDING' },
    });
  }

  /** Creates a minimal Project + Repository under the user's first
   * organization/workspace, with no upload required. Exists so features
   * like AI chat can be tried immediately without going through the full
   * upload/GitHub-import pipeline first. */
  async quickStart(userId: string) {
    const project = await this.getOrCreateDefaultProject(userId);
    return this.prisma.repository.create({
      data: { projectId: project.id, name: 'Test Chat Repository', type: 'SINGLE_FILE', status: 'READY' },
    });
  }

  async getTree(userId: string, repositoryId: string) {
    await this.findOne(userId, repositoryId);

    return this.cache.getOrSet(`repo-tree:${repositoryId}`, 300, async () => {
      const [folders, files] = await Promise.all([
        this.prisma.repositoryFolder.findMany({ where: { repositoryId } }),
        this.prisma.repositoryFile.findMany({
          where: { repositoryId },
          select: { id: true, path: true, extension: true, language: true, sizeBytes: true, lineCount: true },
        }),
      ]);
      return { folders, files };
    });
  }

  async getFile(userId: string, repositoryId: string, fileId: string) {
    await this.findOne(userId, repositoryId);
    const file = await this.prisma.repositoryFile.findUnique({ where: { id: fileId } });
    if (!file || file.repositoryId !== repositoryId) throw new NotFoundException('File not found');
    return file;
  }

  async archive(userId: string, repositoryId: string) {
    const repository = await this.findOne(userId, repositoryId);
    return this.prisma.repository.update({ where: { id: repository.id }, data: { status: 'ARCHIVED' } });
  }

  async remove(userId: string, repositoryId: string) {
    const repository = await this.findOne(userId, repositoryId);
    await this.prisma.repository.delete({ where: { id: repository.id } });
    return { success: true };
  }

  async updateStatus(repositoryId: string, status: 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED') {
    await this.cache.invalidate(`repo-tree:${repositoryId}`);
    return this.prisma.repository.update({ where: { id: repositoryId }, data: { status } });
  }
}
