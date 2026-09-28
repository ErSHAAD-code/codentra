import { IsIn } from 'class-validator';

export class UpdateFindingStatusDto {
  @IsIn(['OPEN', 'RESOLVED', 'IGNORED'])
  status!: 'OPEN' | 'RESOLVED' | 'IGNORED';
}
