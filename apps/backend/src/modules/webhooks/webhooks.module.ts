import { Module } from '@nestjs/common';

import { GithubModule } from '@/modules/github/github.module';

import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [GithubModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
