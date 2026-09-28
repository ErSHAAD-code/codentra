export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export type ProviderId = 'openrouter' | 'google' | 'openai' | 'anthropic';

export interface ModelCapability {
  supportsStreaming: boolean;
  supportsToolCalling: boolean;
  supportsAgentMode: boolean;
  supportsStructuredOutput: boolean;
}

export interface ModelInfo {
  id: string;
  provider: ProviderId;
  name: string;
  badge?: '⚡ Fast' | '🧠 Advanced' | '🛠 Agent Capable';
  capabilities: ModelCapability;
  isConfigured: boolean;
}

export interface AIProvider {
  id: ProviderId;
  name: string;
  getAvailableModels(): ModelInfo[];
  complete(messages: ChatMessage[], systemPrompt?: string, modelId?: string): Promise<string>;
  stream(messages: ChatMessage[], systemPrompt?: string, modelId?: string): AsyncIterable<string>;
}

export const AI_PROVIDER = Symbol('AI_PROVIDER');
