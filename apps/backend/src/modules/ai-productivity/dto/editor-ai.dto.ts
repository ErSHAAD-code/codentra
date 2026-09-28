import { IsOptional, IsString } from 'class-validator';

export class EditorAiPromptDto {
  @IsString()
  action!: string; // 'EXPLAIN' | 'FIND_ERRORS' | 'FIX' | 'OPTIMIZE' | 'REVIEW' | 'GENERATE_TESTS' | 'CHAT'

  @IsOptional()
  @IsString()
  userPrompt?: string;

  @IsOptional()
  @IsString()
  filePath?: string;

  @IsOptional()
  @IsString()
  fileContent?: string;

  @IsOptional()
  @IsString()
  selectedCode?: string;

  @IsOptional()
  @IsString()
  repoOwner?: string;

  @IsOptional()
  @IsString()
  repoName?: string;

  @IsOptional()
  @IsString()
  branch?: string;
}

export interface EditorAiResponse {
  replyText: string;
  suggestedCode?: string;
  originalCode?: string;
  hasDiffProposal: boolean;
}
