import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';

import { CreateInvitationDto } from './dto/invitation.dto';
import { InvitationsService } from './invitations.service';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PermissionGuard } from '@/common/permissions/permission.guard';
import { RequirePermission } from '@/common/permissions/require-permission.decorator';
import { SessionGuard } from '@/modules/auth/guards/session.guard';


@Controller('organizations/:organizationId/invitations')
@UseGuards(SessionGuard, PermissionGuard)
export class InvitationsController {
  constructor(private readonly invitations: InvitationsService) {}

  @Post()
  @RequirePermission('member:invite')
  create(@CurrentUser() user: User, @Param('organizationId') organizationId: string, @Body() dto: CreateInvitationDto) {
    return this.invitations.create(organizationId, user.id, dto);
  }

  @Get()
  @RequirePermission('member:invite')
  list(@Param('organizationId') organizationId: string) {
    return this.invitations.list(organizationId);
  }

  @Delete(':id')
  @RequirePermission('member:invite')
  cancel(@Param('organizationId') organizationId: string, @Param('id') id: string) {
    return this.invitations.cancel(organizationId, id);
  }

  @Post(':id/resend')
  @RequirePermission('member:invite')
  resend(@Param('organizationId') organizationId: string, @Param('id') id: string) {
    return this.invitations.resend(organizationId, id);
  }
}

// Accept/reject are user-scoped, not organization-permission-scoped —
// any authenticated user can respond to an invitation addressed to them.
@Controller('invitations')
@UseGuards(SessionGuard)
export class InvitationResponseController {
  constructor(private readonly invitations: InvitationsService) {}

  @Post(':token/accept')
  accept(@CurrentUser() user: User, @Param('token') token: string) {
    return this.invitations.accept(user.id, user.email, token);
  }

  @Post(':token/reject')
  reject(@Param('token') token: string) {
    return this.invitations.reject(token);
  }
}
