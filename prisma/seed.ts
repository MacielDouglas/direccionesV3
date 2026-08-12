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
    // biome-ignore lint/suspicious/noConsole: log intencional do seed
    console.warn("[seed] SUPER_USER_EMAIL no definido — saltando Super User.");
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

  // biome-ignore lint/suspicious/noConsole: log intencional do seed
  console.log(`[seed] Super User listo: ${user.email}`);
}

main()
  .catch((error) => {
    // biome-ignore lint/suspicious/noConsole: log intencional do seed
    console.error("[seed] Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
