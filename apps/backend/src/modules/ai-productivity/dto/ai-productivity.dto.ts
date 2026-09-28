import { IsOptional, IsString } from 'class-validator';

export class GenerateTestsDto {
  @IsString()
  fileId!: string;

  @IsOptional()
  @IsString()
  framework?: string; // defaults inferred from file language if omitted
}

export class ExplainFileDto {
  @IsString()
  fileId!: string;
}

export class DebugCodeDto {
  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  errorContext?: string;
}

export class CommitMessageDto {
  @IsString()
  diff!: string;
}

export class RefactorFileDto {
  @IsString()
  fileId!: string;
}

export class SqlExplainDto {
  @IsString()
  query!: string;
}
