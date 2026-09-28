export type ValidationCommandType = 'typecheck' | 'lint' | 'test' | 'build';

export interface ValidationRequestDto {
  command: ValidationCommandType;
  repoOwner?: string;
  repoName?: string;
  branch?: string;
  files?: string[];
}

export interface ValidationLogEntry {
  line: string;
  type: 'stdout' | 'stderr' | 'info';
  timestamp: string;
}

export interface ValidationResultDto {
  command: ValidationCommandType;
  success: boolean;
  exitCode: number;
  durationMs: number;
  summary: string;
  errorCount: number;
  warningCount: number;
  logs: ValidationLogEntry[];
  parsedErrors: Array<{
    file?: string;
    line?: number;
    column?: number;
    message: string;
    code?: string;
    severity: 'error' | 'warning';
  }>;
}

export interface AgentValidationLoopState {
  currentAttempt: number;
  maxAttempts: number;
  isLoopActive: boolean;
  lastValidationResult: ValidationResultDto | null;
  history: Array<{
    attempt: number;
    result: ValidationResultDto;
    proposedFixId?: string;
  }>;
}
