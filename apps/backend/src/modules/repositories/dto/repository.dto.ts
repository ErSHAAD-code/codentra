import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum RepositoryTypeDto {
  GITHUB = 'GITHUB',
  ZIP_UPLOAD = 'ZIP_UPLOAD',
  SINGLE_FILE = 'SINGLE_FILE',
}

export class NewRepositoryDto {
  @IsString()
  @MaxLength(150)
  name!: string;
}

export class CreateRepositoryDto {
  @IsString()
  projectId!: string;

  @IsString()
  @MaxLength(150)
  name!: string;

  @IsEnum(RepositoryTypeDto)
  type!: RepositoryTypeDto;

  @IsOptional()
  @IsString()
  githubUrl?: string;
}
