import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAgentPlanDto {
  @IsString()
  @IsNotEmpty()
  task!: string;

  @IsOptional()
  @IsString()
  filePath?: string;

  @IsOptional()
  @IsString()
  fileContent?: string;

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

export interface AgentPlanStep {
  id: string;
  title: string;
  description: string;
  targetFiles?: string[];
  status: 'pending' | 'in_progress' | 'completed';
}

export interface AgentPlanResult {
  task: string;
  summary: string;
  architectureOverview?: string;
  steps: AgentPlanStep[];
}
