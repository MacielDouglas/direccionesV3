"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/users";

export const setActiveOrg = async (organizationId: string) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("No autenticado.");

  const person = await prisma.person.findFirst({
    where: {
      userId: currentUser.user.id,
      organizationId,
    },
  });
  if (!person) throw new Error("No eres miembro de esta organización.");

  await prisma.person.update({
    where: { id: person.id },
    data: { lastActiveAt: new Date() },
  });
};
