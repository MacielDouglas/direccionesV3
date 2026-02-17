import { prisma } from "@/lib/prisma";

type GetMembershipParams = {
  userId: string;
  organizationId: string;
};

export async function getMembership({
  userId,
  organizationId,
}: GetMembershipParams) {
  return prisma.member.findFirst({
    where: {
      userId,
      organizationId,
    },
  });
}
