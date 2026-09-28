import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

import { PrismaService } from '@/common/prisma/prisma.service';

/**
 * Codentra's auth UI/flow lives in Auth.js (apps/frontend) — it issues
 * sessions and stores them in the shared `sessions` table via the Prisma
 * adapter. This guard does NOT reimplement login; it validates the
 * session token Auth.js already issued, by checking it against the same
 * table, and attaches the resolved user onto the request.
 *
 * This keeps auth logic in exactly one place (Auth.js) while still
 * letting the NestJS API enforce it independently.
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing session token');
    }

    const session = await this.prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true },
    });

    if (!session || session.expires < new Date()) {
      throw new UnauthorizedException('Session expired or invalid');
    }

    // Attach for @CurrentUser() decorator and downstream services
    (request as Request & { user: typeof session.user }).user = session.user;
    return true;
  }

  private extractToken(request: Request): string | null {
    const header = request.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      return header.slice(7);
    }
    return request.cookies?.['codentra.session-token'] ?? null;
  }
}
