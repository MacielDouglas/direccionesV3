import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("[seed] Variable de entorno DATABASE_URL no definida.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const superUserEmail = process.env.SUPER_USER_EMAIL;

  if (!superUserEmail) {
    process.stdout.write("[seed] SUPER_USER_EMAIL no definido — saltando Super User.\n");
    return;
  }

  const user = await prisma.user.upsert({
    where: { email: superUserEmail },
    update: { isSuperUser: true },
    create: {
      email: superUserEmail,
      name: "Super User",
      emailVerified: true,
      isSuperUser: true,
    },
  });

  process.stdout.write(`[seed] Super User listo: ${user.email}\n`);
}

main()
  .catch((error) => {
    process.stderr.write(
      `[seed] Error: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`,
    );
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
