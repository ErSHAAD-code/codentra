import { Module } from '@nestjs/common';

import { WebhooksController } from './webhooks.controller';

import { GithubModule } from '@/modules/github/github.module';


@Module({
  imports: [GithubModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
