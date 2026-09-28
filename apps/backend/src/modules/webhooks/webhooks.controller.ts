import { createHmac, timingSafeEqual } from 'crypto';

import { BadRequestException, Controller, Headers, Post, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';

import { PrismaService } from '@/common/prisma/prisma.service';
import { GithubService } from '@/modules/github/github.service';

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET ?? '';

@Controller('webhooks/github')
export class WebhooksController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly github: GithubService,
  ) {}

  @Post()
  async handle(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-hub-signature-256') signature: string,
    @Headers('x-github-event') event: string,
  ) {
    this.verifySignature(req.rawBody, signature);

    const payload = req.body as { repository?: { full_name: string } };
    const repository = await this.prisma.repository.findFirst({
      where: { githubUrl: { contains: payload.repository?.full_name ?? '__no_match__' } },
    });

    if (!repository) {
      // Not an error — we simply don't track this repo. Acknowledge so
      // GitHub doesn't retry a webhook we'll never act on.
      return { received: true, tracked: false };
    }

    const eventType = event === 'push' ? 'PUSH' : event === 'pull_request' ? 'PULL_REQUEST' : null;
    if (!eventType) return { received: true, tracked: false };

    await this.prisma.webhookEvent.create({
      data: { repositoryId: repository.id, type: eventType, payload: payload as never },
    });

    if (eventType === 'PUSH') {
      // callerUserId=null -> GithubService resolves the authorizing token
      // from repository.connectedByUserId (whoever originally imported it).
      await this.github.syncRepository(null, repository.id);
    }

    return { received: true, tracked: true };
  }

  /** GitHub signs every payload with HMAC-SHA256 using the shared webhook
   * secret. Without this check, anyone who discovers the endpoint URL
   * could trigger fake repository syncs. timingSafeEqual prevents a
   * timing attack from leaking the expected signature byte-by-byte. */
  private verifySignature(rawBody: Buffer | undefined, signature: string | undefined): void {
    if (!rawBody || !signature || !WEBHOOK_SECRET) {
      throw new BadRequestException('Missing webhook signature or secret not configured');
    }

    const expected = 'sha256=' + createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex');
    const expectedBuffer = Buffer.from(expected);
    const actualBuffer = Buffer.from(signature);

    if (expectedBuffer.length !== actualBuffer.length || !timingSafeEqual(expectedBuffer, actualBuffer)) {
      throw new BadRequestException('Invalid webhook signature');
    }
  }
}
