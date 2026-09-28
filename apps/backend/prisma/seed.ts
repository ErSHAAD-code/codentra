/**
 * Dev seed data. Mirrors what the real sign-up flow (Step 7) will do
 * automatically: every user gets a personal Organization + Workspace
 * on creation, so multi-tenant scoping is never optional/nullable.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'dev@codentra.local' },
    update: {},
    create: {
      email: 'dev@codentra.local',
      name: 'Dev User',
    },
  });

  const org = await prisma.organization.upsert({
    where: { slug: `${user.id}-personal` },
    update: {},
    create: {
      name: 'Personal',
      slug: `${user.id}-personal`,
      isPersonal: true,
      members: {
        create: { userId: user.id, role: 'OWNER' },
      },
    },
  });

  await prisma.workspace.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: 'default' } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Default',
      slug: 'default',
    },
  });

  console.log(`Seeded user ${user.email} with personal org ${org.slug}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
