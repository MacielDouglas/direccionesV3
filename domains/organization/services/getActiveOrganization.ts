import { prisma } from "@/lib/prisma";

export async function getActiveOrganizationService(userId: string) {
  const person = await prisma.person.findFirst({
    where: { userId },
    include: {
      organization: true,
    },
  });

  return person?.organization ?? null;
}
