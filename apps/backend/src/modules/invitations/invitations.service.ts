import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { CreateInvitationDto } from './dto/invitation.dto';

import { PrismaService } from '@/common/prisma/prisma.service';


const INVITATION_TTL_DAYS = 7;

@Injectable()
export class InvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, invitedBy: string, dto: CreateInvitationDto) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_TTL_DAYS);

    const invitation = await this.prisma.invitation.create({
      data: { organizationId, email: dto.email, role: dto.role, invitedBy, expiresAt },
    });

    await this.prisma.activityLog.create({
      data: { userId: invitedBy, organizationId, action: 'invitation.created', metadata: { email: dto.email } },
    });

    // Email delivery is a placeholder until Phase 7's email infrastructure —
    // the invitation token/record is real and usable via the accept endpoint now.
    return invitation;
  }

  async list(organizationId: string) {
    return this.prisma.invitation.findMany({ where: { organizationId }, orderBy: { createdAt: 'desc' } });
  }

  async accept(userId: string, userEmail: string, token: string) {
    const invitation = await this.getValidInvitation(token);
    if (invitation.email !== userEmail) {
      throw new BadRequestException('This invitation was issued to a different email address');
    }

    await this.prisma.$transaction([
      this.prisma.organizationMember.create({
        data: { userId, organizationId: invitation.organizationId, role: invitation.role },
      }),
      this.prisma.invitation.update({ where: { id: invitation.id }, data: { status: 'ACCEPTED' } }),
      this.prisma.activityLog.create({
        data: { userId, organizationId: invitation.organizationId, action: 'invitation.accepted' },
      }),
    ]);

    return { success: true, organizationId: invitation.organizationId };
  }

  async reject(token: string) {
    const invitation = await this.getValidInvitation(token);
    await this.prisma.invitation.update({ where: { id: invitation.id }, data: { status: 'REJECTED' } });
    return { success: true };
  }

  async cancel(organizationId: string, invitationId: string) {
    const invitation = await this.prisma.invitation.findUnique({ where: { id: invitationId } });
    if (!invitation || invitation.organizationId !== organizationId) throw new NotFoundException('Invitation not found');
    await this.prisma.invitation.update({ where: { id: invitationId }, data: { status: 'CANCELLED' } });
    return { success: true };
  }

  async resend(organizationId: string, invitationId: string) {
    const invitation = await this.prisma.invitation.findUnique({ where: { id: invitationId } });
    if (!invitation || invitation.organizationId !== organizationId) throw new NotFoundException('Invitation not found');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_TTL_DAYS);
    return this.prisma.invitation.update({
      where: { id: invitationId },
      data: { status: 'PENDING', expiresAt },
    });
  }

  private async getValidInvitation(token: string) {
    const invitation = await this.prisma.invitation.findUnique({ where: { token } });
    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.status !== 'PENDING') throw new BadRequestException('Invitation is no longer valid');
    if (invitation.expiresAt < new Date()) throw new BadRequestException('Invitation has expired');
    return invitation;
  }
}
