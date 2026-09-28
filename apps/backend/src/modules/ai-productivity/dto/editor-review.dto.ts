import { IsArray, IsOptional, IsString } from 'class-validator';

export class EditorReviewRequestDto {
  @IsString()
  filePath!: string;

  @IsString()
  fileContent!: string;

  @IsOptional()
  @IsString()
  repoOwner?: string;

  @IsOptional()
  @IsString()
  repoName?: string;

  @IsOptional()
  @IsArray()
  errorMessages?: string[];
}

export interface EditorReviewFinding {
  id: string;
  category: 'BUG' | 'SECURITY' | 'PERFORMANCE' | 'QUALITY' | 'MAINTAINABILITY';
  severity: 'CRITICAL' | 'WARNING' | 'SUGGESTION';
  lineStart: number | null;
  lineEnd: number | null;
  title: string;
  description: string;
  rootCause?: string;
  suggestedFix?: string;
}

export interface EditorReviewResult {
  filePath: string;
  summary: string;
  findings: EditorReviewFinding[];
}
