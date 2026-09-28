import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(organizationId: string) {
    return this.prisma.organizationMember.findMany({
      where: { organizationId },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
      orderBy: { joinedAt: 'asc' },
    });
  }

  async updateRole(organizationId: string, memberId: string, role: string) {
    const member = await this.getMemberOrThrow(organizationId, memberId);
    if (member.role === 'OWNER') {
      throw new BadRequestException("The organization owner's role cannot be changed");
    }
    return this.prisma.organizationMember.update({ where: { id: memberId }, data: { role: role as never } });
  }

  async remove(organizationId: string, memberId: string) {
    const member = await this.getMemberOrThrow(organizationId, memberId);
    if (member.role === 'OWNER') {
      throw new ForbiddenException('The organization owner cannot be removed');
    }
    await this.prisma.organizationMember.delete({ where: { id: memberId } });
    return { success: true };
  }

  private async getMemberOrThrow(organizationId: string, memberId: string) {
    const member = await this.prisma.organizationMember.findUnique({ where: { id: memberId } });
    if (!member || member.organizationId !== organizationId) throw new NotFoundException('Member not found');
    return member;
  }
}
