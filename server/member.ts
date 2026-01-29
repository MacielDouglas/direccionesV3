"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export const addMember = async (
  organizationId: string,
  userId: string,
  role: "owner" | "admin" | "member",
) => {
  try {
    await auth.api.addMember({
      body: {
        userId,
        organizationId,
        role,
      },
    });
  } catch (error) {
    console.error(error);
  }
};

export const removeMemberManually = async (
  organizationId: string,
  memberIdOrEmail: string,
) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Não autenticado.");

  const currentUserId = session.user.id;

  const requester = await prisma.member.findFirst({
    where: {
      organizationId,
      userId: currentUserId,
    },
  });

  if (!requester) {
    throw new Error("Você não pertence a esta organização.");
  }

  if (requester.role === "member") {
    throw new Error("Membros não podem remover outros membros.");
  }

  const target = await prisma.member.findFirst({
    where: {
      organizationId,
      OR: [{ userId: memberIdOrEmail }, { user: { email: memberIdOrEmail } }],
    },
    include: {
      user: true,
    },
  });

  if (!target) {
    throw new Error("Membro não encontrado na organização.");
  }

  if (target.role === "owner") {
    throw new Error("Owners não podem ser removidos.");
  }

  if (target.userId === currentUserId) {
    throw new Error("Você não pode se remover.");
  }

  await prisma.member.delete({
    where: { id: target.id },
  });

  return { success: true, removed: target.user.email };
};
