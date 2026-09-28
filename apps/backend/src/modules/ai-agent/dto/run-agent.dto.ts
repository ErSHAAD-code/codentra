import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AgentFileChange } from './agent-changeset.dto';
import { ValidationResultDto } from './agent-validation.dto';

export class RunAgentDto {
  @IsString()
  @IsNotEmpty()
  task!: string;

  /** GitHub repo context (optional — agent works in pure-chat mode without it) */
  @IsOptional()
  @IsString()
  repoOwner?: string;

  @IsOptional()
  @IsString()
  repoName?: string;

  @IsOptional()
  @IsString()
  branch?: string;

  /** Currently open file path */
  @IsOptional()
  @IsString()
  filePath?: string;

  /** Currently open file content (capped on the frontend before sending) */
  @IsOptional()
  @IsString()
  fileContent?: string;

  /** Code selection from Monaco editor */
  @IsOptional()
  @IsString()
  selectedCode?: string;

  /** Selected AI Model ID (Phase 5 multi-model system) */
  @IsOptional()
  @IsString()
  modelId?: string;

  /** Problems/diagnostics from the editor */
  @IsOptional()
  problems?: Array<{ message: string; severity: string; file?: string; line?: number }>;
}

// ─── Tool Result Types ─────────────────────────────────────────────────────

export interface AgentToolCall {
  tool: AgentToolName;
  args: Record<string, string>;
}

export type AgentToolName =
  | 'get_repository_tree'
  | 'read_file'
  | 'search_code'
  | 'get_dependencies'
  | 'get_current_file'
  | 'get_selected_code'
  | 'get_problems'
  | 'propose_file_change'
  | 'propose_new_file'
  | 'propose_delete_file'
  | 'run_typecheck'
  | 'run_lint'
  | 'run_tests'
  | 'run_build';

export interface AgentToolEvent {
  type:
    | 'tool_call'
    | 'tool_result'
    | 'thinking'
    | 'plan_ready'
    | 'error'
    | 'cancelled'
    | 'change_proposed'
    | 'changeset_ready'
    | 'validation_started'
    | 'validation_completed';
  tool?: AgentToolName;
  args?: Record<string, string>;
  result?: string;
  message?: string;
  plan?: AgentRunResult;
  change?: AgentFileChange;
  changesetId?: string;
  totalChanges?: number;
  validationResult?: ValidationResultDto;
}

export interface AgentRunResult {
  task: string;
  summary: string;
  architectureOverview?: string;
  toolsUsed: string[];
  filesInspected: string[];
  changesetId?: string;
  steps: Array<{
    id: string;
    title: string;
    description: string;
    targetFiles?: string[];
    status: 'pending' | 'in_progress' | 'completed';
  }>;
}
