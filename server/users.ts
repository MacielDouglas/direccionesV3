"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const getCurrentUser = async () => {
  const reqHeaders = await headers();

  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!session) {
    return null;
  }

  const activeMember = await auth.api.getActiveMember({
    headers: reqHeaders,
  });

  const memberRole = activeMember
    ? await auth.api.getActiveMemberRole({ headers: reqHeaders })
    : null;

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!currentUser) {
    return null;
  }

  return {
    session,
    user: currentUser,
    activeMember,
    memberRole,
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
