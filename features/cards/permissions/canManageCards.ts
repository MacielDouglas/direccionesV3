import { prisma } from "@/lib/prisma";

export async function canManageCards(
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const member = await prisma.member.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
    select: { role: true },
  });

  return member?.role === "admin" || member?.role === "owner";
}
