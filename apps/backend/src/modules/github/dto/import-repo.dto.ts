import { IsString } from 'class-validator';

export class ImportGithubRepoDto {
  @IsString()
  projectId!: string;

  @IsString()
  owner!: string;

  @IsString()
  repo!: string;
}
