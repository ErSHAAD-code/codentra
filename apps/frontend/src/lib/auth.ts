import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth, { type NextAuthResult } from 'next-auth';
import GitHub from 'next-auth/providers/github';

import { prisma } from '@/lib/prisma';

/**
 * Auth.js owns login/signup and writes sessions to the shared `sessions`
 * table (via PrismaAdapter) — the same table apps/backend's SessionGuard
 * reads from. This is the one place auth logic lives; the API only
 * validates what's issued here.
 */
const result: NextAuthResult = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' },
  // Explicit cookie name so apps/backend's SessionGuard (which reads this
  // exact cookie to authenticate API calls from the browser) knows what
  // to look for — Auth.js's default name varies by version/config.
  cookies: {
    sessionToken: {
      name: 'codentra.session-token',
      options: { httpOnly: true, sameSite: 'lax', path: '/' },
    },
  },
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
  events: {
    // Every new user gets a personal Organization + Workspace immediately —
    // mirrors prisma/seed.ts, so no user ever exists without tenant scoping.
    async createUser({ user }) {
      const org = await prisma.organization.create({
        data: {
          name: 'Personal',
          slug: `${user.id}-personal`,
          isPersonal: true,
          members: { create: { userId: user.id!, role: 'OWNER' } },
        },
      });
      await prisma.workspace.create({
        data: { organizationId: org.id, name: 'Default', slug: 'default' },
      });
    },
  },
});

export const { handlers, auth, signIn, signOut } = result;
