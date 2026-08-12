"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/users";

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
