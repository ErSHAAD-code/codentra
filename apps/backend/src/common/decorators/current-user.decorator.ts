import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';

/**
 * Usage: findMany(@CurrentUser() user: User) — reads the user SessionGuard
 * attached to the request, so controllers never touch req.user directly.
 */
export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): User => {
  const request = ctx.switchToHttp().getRequest<Request & { user: User }>();
  return request.user;
});
