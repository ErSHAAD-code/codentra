import { Injectable } from '@nestjs/common';
import { AIProvider, ChatMessage, ModelInfo } from './ai-provider.interface';
import { ClaudeProvider } from './claude.provider';
import { GeminiProvider } from './gemini.provider';
import { OpenAIProvider } from './openai.provider';

@Injectable()
export class MultiModelProviderService implements AIProvider {
  id = 'openrouter' as const;
  name = 'Multi-Model Provider Router';

  private readonly providers: AIProvider[];

  constructor(
    private readonly claude: ClaudeProvider,
    private readonly gemini: GeminiProvider,
    private readonly openai: OpenAIProvider,
  ) {
    this.providers = [this.claude, this.gemini, this.openai];
  }

  getAvailableModels(): ModelInfo[] {
    return this.providers.flatMap((p) => p.getAvailableModels());
  }

  private resolveProvider(modelId?: string): { provider: AIProvider; targetModel: string } {
    if (!modelId) {
      return { provider: this.claude, targetModel: 'openrouter/auto' };
    }

    const allModels = this.getAvailableModels();
    const found = allModels.find((m) => m.id === modelId);

    if (found) {
      if (found.provider === 'google') return { provider: this.gemini, targetModel: modelId };
      if (found.provider === 'openai') return { provider: this.openai, targetModel: modelId };
      return { provider: this.claude, targetModel: modelId };
    }

    return { provider: this.claude, targetModel: modelId };
  }

  async complete(messages: ChatMessage[], systemPrompt?: string, modelId?: string): Promise<string> {
    const { provider, targetModel } = this.resolveProvider(modelId);
    return provider.complete(messages, systemPrompt, targetModel);
  }

  async *stream(messages: ChatMessage[], systemPrompt?: string, modelId?: string): AsyncIterable<string> {
    const { provider, targetModel } = this.resolveProvider(modelId);
    yield* provider.stream(messages, systemPrompt, targetModel);
  }
}
