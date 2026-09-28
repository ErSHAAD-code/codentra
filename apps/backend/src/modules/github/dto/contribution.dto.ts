import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class FileChangeItemDto {
  @IsString()
  @IsNotEmpty()
  path!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  sha?: string;
}

export class CheckPermissionQueryDto {
  @IsString()
  @IsNotEmpty()
  owner!: string;

  @IsString()
  @IsNotEmpty()
  repo!: string;

  @IsString()
  @IsNotEmpty()
  branch!: string;
}

export class SubmitContributionDto {
  @IsString()
  @IsNotEmpty()
  owner!: string;

  @IsString()
  @IsNotEmpty()
  repo!: string;

  @IsString()
  @IsNotEmpty()
  baseBranch!: string;

  @IsString()
  @IsNotEmpty()
  commitMessage!: string;

  @IsOptional()
  @IsString()
  prTitle?: string;

  @IsOptional()
  @IsString()
  prBody?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileChangeItemDto)
  changes!: FileChangeItemDto[];
}

export interface PermissionCheckResult {
  owner: string;
  repo: string;
  branch: string;
  authenticatedUser: string;
  hasWriteAccess: boolean;
  isBranchProtected: boolean;
  suggestedWorkflow: 'DIRECT_COMMIT' | 'NEW_BRANCH_PR' | 'FORK_PR';
}

export interface ContributionSubmissionResult {
  success: boolean;
  workflow: 'DIRECT_COMMIT' | 'FORK_PR';
  commitUrl?: string;
  prUrl?: string;
  prNumber?: number;
  forkRepo?: string;
  branchName?: string;
  message: string;
}
