import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Wraps PrismaClient in a NestJS-managed provider so every module gets
 * the same connection pool via dependency injection, and the connection
 * lifecycle is tied to the app's lifecycle (connect on boot, disconnect
 * on shutdown) instead of being managed manually per-module.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
