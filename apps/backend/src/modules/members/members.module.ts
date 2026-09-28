import { Module } from '@nestjs/common';


import { MembersController } from './members.controller';
import { MembersService } from './members.service';

import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [MembersController],
  providers: [MembersService],
})
export class MembersModule {}
