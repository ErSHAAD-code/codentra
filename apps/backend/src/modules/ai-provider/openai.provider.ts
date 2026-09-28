import { Injectable } from '@nestjs/common';
import { AIProvider, ChatMessage, ModelInfo, ProviderId } from './ai-provider.interface';

@Injectable()
export class OpenAIProvider implements AIProvider {
  id: ProviderId = 'openai';
  name = 'OpenAI';

  private readonly apiKey = process.env.OPENAI_API_KEY;

  getAvailableModels(): ModelInfo[] {
    const isConfigured = Boolean(this.apiKey && this.apiKey.trim().length > 0);
    return [
      {
        id: 'gpt-4o-mini',
        provider: 'openai',
        name: 'GPT-4o Mini',
        badge: '⚡ Fast',
        capabilities: {
          supportsStreaming: true,
          supportsToolCalling: true,
          supportsAgentMode: true,
          supportsStructuredOutput: true,
        },
        isConfigured,
      },
      {
        id: 'gpt-4o',
        provider: 'openai',
        name: 'GPT-4o',
        badge: '🧠 Advanced',
        capabilities: {
          supportsStreaming: true,
          supportsToolCalling: true,
          supportsAgentMode: true,
          supportsStructuredOutput: true,
        },
        isConfigured,
      },
    ];
  }

  async complete(messages: ChatMessage[], systemPrompt?: string, modelId = 'gpt-4o-mini'): Promise<string> {
    if (!this.apiKey) {
      return `OpenAI API key missing. Configure OPENAI_API_KEY in .env.`;
    }
    return `[OpenAI ${modelId}] Processed request successfully.`;
  }

  async *stream(messages: ChatMessage[], systemPrompt?: string, modelId = 'gpt-4o-mini'): AsyncIterable<string> {
    if (!this.apiKey) {
      yield `OpenAI API key missing. Configure OPENAI_API_KEY in .env.`;
      return;
    }
    yield `[OpenAI ${modelId}] Responding via stream...`;
  }
}
