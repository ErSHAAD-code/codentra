import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

import { PrismaService } from '@/common/prisma/prisma.service';
import { slugify } from '@/common/utils/slugify';


@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Every read/write is scoped through workspace -> organization -> membership,
   * so a user can never touch a project outside orgs they belong to. */
  private async assertWorkspaceAccess(workspaceId: string, userId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { organization: { include: { members: { where: { userId } } } } },
    });

    if (!workspace || workspace.organization.members.length === 0) {
      throw new ForbiddenException('No access to this workspace');
    }
    return workspace;
  }

  async create(userId: string, dto: CreateProjectDto) {
    await this.assertWorkspaceAccess(dto.workspaceId, userId);

    return this.prisma.project.create({
      data: {
        workspaceId: dto.workspaceId,
        name: dto.name,
        slug: slugify(dto.name),
        description: dto.description,
      },
    });
  }

  async findAllForUser(userId: string, workspaceId: string) {
    await this.assertWorkspaceAccess(workspaceId, userId);
    return this.prisma.project.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    await this.assertWorkspaceAccess(project.workspaceId, userId);
    return project;
  }

  async update(userId: string, projectId: string, dto: UpdateProjectDto) {
    const project = await this.findOne(userId, projectId); // also asserts access
    return this.prisma.project.update({
      where: { id: project.id },
      data: dto,
    });
  }

  async archive(userId: string, projectId: string) {
    return this.update(userId, projectId, { status: 'ARCHIVED' });
  }

  async remove(userId: string, projectId: string) {
    const project = await this.findOne(userId, projectId);
    await this.prisma.project.delete({ where: { id: project.id } });
    return { success: true };
  }
}
