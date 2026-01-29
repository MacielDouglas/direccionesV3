"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const getCurrentUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  console.log("Session in getCurrentUser:", session);

  if (!session) return redirect("/login");

  const activeMember = await auth.api.getActiveMember({
    headers: await headers(),
  });

  if (!activeMember) {
    const memberRole = null;
    return { ...session, memberRole };
  }

  const memberRole = await auth.api.getActiveMemberRole({
    headers: await headers(),
  });

  const sessionUserId = session.user.id;

  const currentUser = await prisma.user.findUnique({
    where: { id: sessionUserId },
  });

  if (!currentUser) return redirect("/login");

  return {
    ...session,
    currentUser,
    memberRole,
    activeMember,
  };
};

export const getUsers = async (organizationId: string) => {
  try {
    const members = await prisma.member.findMany({
      where: { organizationId },
      select: { userId: true },
    });

    const memberIds = members.map((m) => m.userId);

    const users = await prisma.user.findMany({
      where: {
        id: {
          notIn: memberIds.length > 0 ? memberIds : [""], // evita erro com array vazio
        },
      },
    });

    return users;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const sessionUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/");
};
