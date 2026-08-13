import { prisma } from "@/lib/prisma";

export async function canManageCards(userId: string, organizationId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSuperUser: true },
  });

  if (user?.isSuperUser) return true;

  const person = await prisma.person.findFirst({
    where: { userId, organizationId },
    select: { role: true },
  });

  return person?.role === "admin" || person?.role === "owner";
}
