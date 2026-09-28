import { PrismaClient } from '@prisma/client';

// Singleton pattern: Next.js hot-reloads modules in dev, which would
// otherwise create a new PrismaClient (and DB connection) per reload.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
