import { Injectable } from '@nestjs/common';
import { AIProvider, ChatMessage, ModelInfo, ProviderId } from './ai-provider.interface';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

@Injectable()
export class ClaudeProvider implements AIProvider {
  id: ProviderId = 'openrouter';
  name = 'Anthropic Claude / OpenRouter';

  private readonly apiKey = process.env.OPENROUTER_API_KEY ?? process.env.ANTHROPIC_API_KEY;

  getAvailableModels(): ModelInfo[] {
    const isConfigured = Boolean(this.apiKey && this.apiKey.trim().length > 0);
    return [
      {
        id: 'openrouter/auto',
        provider: 'openrouter',
        name: 'OpenRouter Auto',
        badge: '⚡ Fast',
        capabilities: {
          supportsStreaming: true,
          supportsToolCalling: true,
          supportsAgentMode: true,
          supportsStructuredOutput: true,
        },
        isConfigured: true, // Always available with demo mode fallback
      },
      {
        id: 'anthropic/claude-3.5-sonnet',
        provider: 'anthropic',
        name: 'Claude 3.5 Sonnet',
        badge: '🛠 Agent Capable',
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

  async complete(messages: ChatMessage[], systemPrompt?: string, modelId = 'openrouter/auto'): Promise<string> {
    const response = await this.callOpenRouter(messages, systemPrompt, false, modelId);

    if (!response.ok) {
      return 'I am running in **Demo Mode** because the API key is missing, or the model is offline. Please add a valid `OPENROUTER_API_KEY` to your `.env` file.';
    }

    const data = (await response.json()) as any;
    return data.choices?.[0]?.message?.content ?? '';
  }

  async *stream(messages: ChatMessage[], systemPrompt?: string, modelId = 'openrouter/auto'): AsyncIterable<string> {
    const response = await this.callOpenRouter(messages, systemPrompt, true, modelId);

    if (!response.ok) {
      const mockResponse = `I am running in **Demo Mode** (${modelId}) because the OpenRouter API key is missing or invalid.

Add \`OPENROUTER_API_KEY\` to your \`.env\` file to activate real AI models!`;

      const words = mockResponse.split(' ');
      for (let i = 0; i < words.length; i++) {
        yield words[i] + (i < words.length - 1 ? ' ' : '');
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
      return;
    }

    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ') || trimmed === 'data: [DONE]') continue;

        try {
          const payload = JSON.parse(trimmed.slice(6));
          const text = payload.choices?.[0]?.delta?.content;
          if (text) yield text;
        } catch {
          // ignore chunk parse error
        }
      }
    }
  }

  private callOpenRouter(messages: ChatMessage[], systemPrompt: string | undefined, stream: boolean, modelId: string) {
    const formattedMessages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    return fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey ?? ''}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Codentra',
      },
      body: JSON.stringify({
        model: modelId,
        messages: formattedMessages,
        stream,
      }),
    });
  }
}
