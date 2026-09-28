import { IsEmail, IsIn } from 'class-validator';

export class CreateInvitationDto {
  @IsEmail()
  email!: string;

  @IsIn(['ADMIN', 'MANAGER', 'DEVELOPER', 'REVIEWER', 'VIEWER', 'GUEST'])
  role!: 'ADMIN' | 'MANAGER' | 'DEVELOPER' | 'REVIEWER' | 'VIEWER' | 'GUEST';
}
