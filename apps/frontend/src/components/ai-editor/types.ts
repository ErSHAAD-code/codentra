export type QuickActionType =
  | 'EXPLAIN'
  | 'FIND_ERRORS'
  | 'FIX'
  | 'OPTIMIZE'
  | 'REVIEW'
  | 'GENERATE_TESTS';

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  suggestedCode?: string;
  originalCode?: string;
  hasDiffProposal?: boolean;
  status?: 'pending' | 'applied' | 'rejected';
}

export type ChangeOperation = 'MODIFY' | 'CREATE' | 'DELETE';

export interface AgentFileChange {
  id: string;
  path: string;
  operation: ChangeOperation;
  originalContent: string;
  proposedContent: string;
  reason: string;
  decision: 'accepted' | 'rejected' | null;
}

export interface AgentChangeset {
  id: string;
  userId: string;
  repoOwner: string;
  repoName: string;
  branch: string;
  task: string;
  changes: AgentFileChange[];
  createdAt: string;
  status: 'building' | 'ready' | 'applied' | 'rejected';
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
