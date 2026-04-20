"use server";

import { createOrganizationService } from "@/domains/organization";
import { getCurrentUser } from "@/server/users";
import { prisma } from "@/lib/prisma";
import { toRole } from "@/domains/member/utils/toRole";

export async function createOrganizationAction(data: {
  name: string;
  slug: string;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("No autorizado.");

  return createOrganizationService(data, {
    userId: currentUser.user.id,
    role: toRole(currentUser.user.role),
  });
}


export const setActiveOrg = async (organizationId: string) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("No autenticado.");

  await prisma.member.updateMany({
    where: {
      userId: currentUser.user.id,
      organizationId,
    },
    data: { lastActiveAt: new Date() },
  });
};