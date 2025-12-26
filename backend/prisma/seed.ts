import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  await prisma.auctionState.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  const email = 'admin@auction.local';
  const passwordHash = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email },
    update: { role: Role.ADMIN, passwordHash, teamId: null },
    create: { email, role: Role.ADMIN, passwordHash },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

