import { Module } from '@nestjs/common';


import { InvitationResponseController, InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';

import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [InvitationsController, InvitationResponseController],
  providers: [InvitationsService],
})
export class InvitationsModule {}
