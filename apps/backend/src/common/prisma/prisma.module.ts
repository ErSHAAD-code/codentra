import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';

/**
 * @Global means every feature module (health, auth, and Phase 2's
 * repository/project modules) can inject PrismaService without
 * importing PrismaModule directly — avoids repetitive imports while
 * keeping the service itself explicitly defined in one place.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
