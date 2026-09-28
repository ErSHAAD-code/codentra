import { Controller, Get } from '@nestjs/common';
import { createClient } from 'redis';

import { PrismaService } from '@/common/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /** Liveness — is the process itself up? No dependency checks; a load
   * balancer/orchestrator uses this to decide whether to restart the pod. */
  @Get('live')
  live() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  /** Readiness — is the process able to serve real traffic? Checks every
   * hard dependency; a load balancer uses this to decide whether to route
   * traffic here, distinct from whether the process should be restarted. */
  @Get('ready')
  async ready() {
    const [database, redis] = await Promise.all([this.checkDatabase(), this.checkRedis()]);
    const aiProviderConfigured = Boolean(process.env.ANTHROPIC_API_KEY);

    const allHealthy = database === 'connected' && redis === 'connected' && aiProviderConfigured;

    return {
      status: allHealthy ? 'ok' : 'degraded',
      checks: { database, redis, aiProvider: aiProviderConfigured ? 'configured' : 'missing_api_key' },
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  async check() {
    return this.ready();
  }

  private async checkDatabase(): Promise<'connected' | 'unreachable'> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'connected';
    } catch {
      return 'unreachable';
    }
  }

  private async checkRedis(): Promise<'connected' | 'unreachable'> {
    try {
      const client = createClient({ url: process.env.REDIS_URL ?? 'redis://localhost:6379' });
      await client.connect();
      await client.ping();
      await client.quit();
      return 'connected';
    } catch {
      return 'unreachable';
    }
  }
}
