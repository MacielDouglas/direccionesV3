import { prisma } from "@/lib/prisma";

export async function getActiveOrganizationService(userId: string) {
  const member = await prisma.member.findFirst({
    where: { userId },
    include: {
      organization: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return member?.organization ?? null;
}
