import { Module } from '@nestjs/common';

import { SessionGuard } from './guards/session.guard';

@Module({
  providers: [SessionGuard],
  exports: [SessionGuard],
})
export class AuthModule {}
