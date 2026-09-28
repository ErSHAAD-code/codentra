import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { CacheModule } from '@/common/cache/cache.module';
import { RequestIdMiddleware } from '@/common/interceptors/request-id.middleware';
import { StructuredLogger } from '@/common/logger/structured-logger';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { QueueModule } from '@/common/queue/queue.module';
import { AiAgentModule } from '@/modules/ai-agent/ai-agent.module';
import { AiProductivityModule } from '@/modules/ai-productivity/ai-productivity.module';
import { AnalysisModule } from '@/modules/analysis/analysis.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { ChatModule } from '@/modules/chat/chat.module';
import { GithubModule } from '@/modules/github/github.module';
import { HealthModule } from '@/modules/health/health.module';
import { InvitationsModule } from '@/modules/invitations/invitations.module';
import { MembersModule } from '@/modules/members/members.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { ProjectsModule } from '@/modules/projects/projects.module';
import { RepositoriesModule } from '@/modules/repositories/repositories.module';
import { UploadsModule } from '@/modules/uploads/uploads.module';
import { WebhooksModule } from '@/modules/webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000, // 1 minute window
        limit: 100, // requests per window per client — tuned per-endpoint later (Phase 8)
      },
    ]),
    PrismaModule,
    CacheModule,
    QueueModule,
    AuthModule,
    HealthModule,
    ProjectsModule,
    RepositoriesModule,
    UploadsModule,
    ChatModule,
    AnalysisModule,
    AiProductivityModule,
    AiAgentModule,
    MembersModule,
    InvitationsModule,
    NotificationsModule,
    GithubModule,
    WebhooksModule,
  ],
  providers: [StructuredLogger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
