import { IsString } from 'class-validator';

export class GetFileContentDto {
  @IsString()
  path!: string;

  @IsString()
  ref!: string;
}
