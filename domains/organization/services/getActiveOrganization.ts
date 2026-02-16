import { prisma } from "@/lib/prisma";

export async function getActiveOrganizationService(userId: string) {
  const member = await prisma.member.findFirst({
    where: { userId },
  });

  if (!member) return null;

  return prisma.organization.findUnique({
    where: { id: member.organizationId },
  });
}
