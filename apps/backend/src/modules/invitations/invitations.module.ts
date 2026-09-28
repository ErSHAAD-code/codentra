import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';

import { InvitationResponseController, InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';

@Module({
  imports: [AuthModule],
  controllers: [InvitationsController, InvitationResponseController],
  providers: [InvitationsService],
})
export class InvitationsModule {}
