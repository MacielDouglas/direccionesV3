"use server";

import type { Role } from "@/domains/member/types/role.types";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export const addMember = async (
  organizationId: string,
  userId: string,
  slug: string,
  role: Role,
) => {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) throw new Error("No autenticado.");

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isSuperUser: true },
  });
  const isSuperUser = currentUser?.isSuperUser ?? false;

  if (!isSuperUser) {
    const requester = await prisma.member.findFirst({
      where: { organizationId, userId: session.user.id },
      select: { role: true },
    });
    if (!requester || !["owner", "admin"].includes(requester.role)) {
      throw new Error("Sin permiso.");
    }
  }

  const existingMembership = await prisma.member.count({ where: { userId } });
  if (existingMembership > 0) {
    throw new Error("El usuario ya pertenece a una organización.");
  }

  await prisma.member.create({
    data: {
      id: crypto.randomUUID(),
      organizationId,
      userId,
      role,
      lastActiveAt: new Date(),
    },
  });

  revalidatePath(`/org/${slug}/admin/users`);
};

export const memberUpdateRole = async (
  organizationId: string,
  memberId: string,
  role: Role,
  slug?: string,
) => {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) throw new Error("No autenticado.");

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isSuperUser: true },
  });
  const isSuperUser = currentUser?.isSuperUser ?? false;

  const target = await prisma.member.findFirst({
    where: { id: memberId, organizationId },
    select: { id: true, role: true, userId: true },
  });
  if (!target) throw new Error("Miembro no encontrado.");

  if (!isSuperUser) {
    const requester = await prisma.member.findFirst({
      where: { organizationId, userId: session.user.id },
      select: { role: true },
    });
    if (!requester || !["owner", "admin"].includes(requester.role)) {
      throw new Error("Sin permiso para modificar roles.");
    }

    if (requester.role === "admin") {
      if (target.role === "owner" || role === "owner") {
        throw new Error("Solo el owner puede gestionar owners.");
      }
    }

    if (target.role === "owner" && role !== "owner") {
      const ownerCount = await prisma.member.count({
        where: { organizationId, role: "owner" },
      });
      if (ownerCount <= 1) throw new Error("No puedes quitar el único owner.");
    }
  }

  await prisma.member.update({
    where: { id: target.id },
    data: { role },
  });

  if (slug) revalidatePath(`/org/${slug}/admin/users`);
};

export const removeMemberManually = async (organizationId: string, memberIdOrEmail: string) => {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) throw new Error("No autenticado.");

  const currentUserId = session.user.id;

  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { isSuperUser: true },
  });
  const isSuperUser = currentUser?.isSuperUser ?? false;

  if (!isSuperUser) {
    const requester = await prisma.member.findFirst({
      where: { organizationId, userId: currentUserId },
      select: { role: true },
    });
    if (!requester) {
      throw new Error("No perteneces a esta organización.");
    }
    if (requester.role === "member") {
      throw new Error("Los miembros no pueden eliminar a otros miembros.");
    }
  }

  const target = await prisma.member.findFirst({
    where: {
      organizationId,
      OR: [{ userId: memberIdOrEmail }, { user: { email: memberIdOrEmail } }],
    },
    include: { user: { select: { email: true } } },
  });

  if (!target) {
    throw new Error("Miembro no encontrado en la organización.");
  }

  if (!isSuperUser && target.role === "owner") {
    throw new Error("Los Owners no pueden ser eliminados.");
  }

  if (target.userId === currentUserId) {
    throw new Error("No puedes eliminarte a ti mismo.");
  }

  await prisma.member.delete({ where: { id: target.id } });

  return { success: true, removed: target.user.email };
};
