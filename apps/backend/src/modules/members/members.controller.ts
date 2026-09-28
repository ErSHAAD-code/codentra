import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { IsIn } from 'class-validator';

import { PermissionGuard } from '@/common/permissions/permission.guard';
import { RequirePermission } from '@/common/permissions/require-permission.decorator';
import { SessionGuard } from '@/modules/auth/guards/session.guard';

import { MembersService } from './members.service';

class UpdateRoleDto {
  @IsIn(['ADMIN', 'MANAGER', 'DEVELOPER', 'REVIEWER', 'VIEWER', 'GUEST'])
  role!: string;
}

@Controller('organizations/:organizationId/members')
@UseGuards(SessionGuard, PermissionGuard)
export class MembersController {
  constructor(private readonly members: MembersService) {}

  @Get()
  list(@Param('organizationId') organizationId: string) {
    return this.members.list(organizationId);
  }

  @Patch(':id/role')
  @RequirePermission('member:remove') // role changes gated at the same level as removal
  updateRole(@Param('organizationId') organizationId: string, @Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.members.updateRole(organizationId, id, dto.role);
  }

  @Delete(':id')
  @RequirePermission('member:remove')
  remove(@Param('organizationId') organizationId: string, @Param('id') id: string) {
    return this.members.remove(organizationId, id);
  }
}
