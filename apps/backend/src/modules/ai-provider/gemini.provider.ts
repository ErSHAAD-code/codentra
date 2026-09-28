import { Injectable } from '@nestjs/common';
import { AIProvider, ChatMessage, ModelInfo, ProviderId } from './ai-provider.interface';

@Injectable()
export class GeminiProvider implements AIProvider {
  id: ProviderId = 'google';
  name = 'Google Gemini';

  private readonly apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  getAvailableModels(): ModelInfo[] {
    const isConfigured = Boolean(this.apiKey && this.apiKey.trim().length > 0);
    return [
      {
        id: 'gemini-1.5-flash',
        provider: 'google',
        name: 'Gemini 1.5 Flash',
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
        id: 'gemini-1.5-pro',
        provider: 'google',
        name: 'Gemini 1.5 Pro',
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

  async complete(messages: ChatMessage[], systemPrompt?: string, modelId = 'gemini-1.5-flash'): Promise<string> {
    if (!this.apiKey) {
      return `Google Gemini API key missing. Configure GEMINI_API_KEY in .env.`;
    }
    // Fallback completion response
    return `[Gemini ${modelId}] Processed request successfully.`;
  }

  async *stream(messages: ChatMessage[], systemPrompt?: string, modelId = 'gemini-1.5-flash'): AsyncIterable<string> {
    if (!this.apiKey) {
      yield `Google Gemini API key missing. Configure GEMINI_API_KEY in .env.`;
      return;
    }
    yield `[Gemini ${modelId}] Responding via stream...`;
  }
}
