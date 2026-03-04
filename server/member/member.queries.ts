import { prisma } from "@/lib/prisma";

interface GetMembershipParams {
  userId: string;
  organizationId: string;
}

export async function getMembership({
  userId,
  organizationId,
}: GetMembershipParams) {
  return prisma.member.findFirst({
    where: { userId, organizationId },
    select: {
      id: true,
      role: true,
      userId: true,
      organizationId: true,
    },
  });
}
