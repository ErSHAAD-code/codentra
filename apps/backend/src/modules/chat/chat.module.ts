import { Module } from '@nestjs/common';

import { AIProviderModule } from '@/modules/ai-provider/ai-provider.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { RepositoriesModule } from '@/modules/repositories/repositories.module';

import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [AuthModule, RepositoriesModule, AIProviderModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
