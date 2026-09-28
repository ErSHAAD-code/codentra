import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { PrismaService } from '@/common/prisma/prisma.service';

import { hasPermission, Permission } from './permission-matrix';
import { PERMISSION_KEY } from './require-permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.get<Permission | undefined>(PERMISSION_KEY, context.getHandler());
    if (!required) return true; // route didn't opt into permission checking

    const request = context.switchToHttp().getRequest<Request & { user: { id: string } }>();
    const organizationId = request.params.organizationId;

    if (!organizationId) {
      throw new ForbiddenException('Missing organizationId in route');
    }

    const membership = await this.prisma.organizationMember.findUnique({
      where: { userId_organizationId: { userId: request.user.id, organizationId } },
    });

    if (!membership || !hasPermission(membership.role, required)) {
      throw new ForbiddenException(`Missing permission: ${required}`);
    }
    return true;
  }
}
