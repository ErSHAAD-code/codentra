import { Module } from '@nestjs/common';
import { AI_PROVIDER } from './ai-provider.interface';
import { ClaudeProvider } from './claude.provider';
import { GeminiProvider } from './gemini.provider';
import { MultiModelProviderService } from './multi-model-provider.service';
import { OpenAIProvider } from './openai.provider';

@Module({
  providers: [
    ClaudeProvider,
    GeminiProvider,
    OpenAIProvider,
    MultiModelProviderService,
    {
      provide: AI_PROVIDER,
      useExisting: MultiModelProviderService,
    },
  ],
  exports: [AI_PROVIDER, MultiModelProviderService, ClaudeProvider, GeminiProvider, OpenAIProvider],
})
export class AIProviderModule {}
