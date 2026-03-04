"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { Role } from "@/domains/member/types/role.types";

export const addMember = async (
  organizationId: string,
  userId: string,
  slug: string,
  role: Role,
) => {
  try {
    await auth.api.addMember({
      body: { userId, organizationId, role },
      headers: await headers(),
    });

    revalidatePath(`/admin/organizations/${slug}`);
  } catch (error) {
    console.error("[addMember]", error);
    throw new Error("No se pudo agregar el miembro. Intente nuevamente.");
  }
};

export const memberUpdateRole = async (
  organizationId: string,
  memberId: string,
  role: Exclude<Role, "owner">,
  slug?: string,
) => {
  const reqHeaders = await headers();
  const activeMember = await auth.api.getActiveMember({ headers: reqHeaders });

  if (!activeMember) {
    throw new Error("El usuario no pertenece a la organización activa.");
  }

  if (!["owner", "admin"].includes(activeMember.role)) {
    throw new Error("Sin permiso para modificar roles.");
  }

  await auth.api.updateMemberRole({
    body: { role, memberId, organizationId },
    headers: reqHeaders,
  });

  if (slug) revalidatePath(`/org/${slug}/admin/users`);
};

export const removeMemberManually = async (
  organizationId: string,
  memberIdOrEmail: string,
) => {
  const reqHeaders = await headers();

  const [session] = await Promise.all([
    auth.api.getSession({ headers: reqHeaders }),
    prisma.member.findFirst({
      where: {
        organizationId,
        user: { OR: [{ id: memberIdOrEmail }, { email: memberIdOrEmail }] },
      },
      select: { id: true, role: true, userId: true },
    }),
  ]);

  if (!session) throw new Error("No autenticado.");

  const currentUserId = session.user.id;

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

  if (target.role === "owner") {
    throw new Error("Los Owners no pueden ser eliminados.");
  }

  if (target.userId === currentUserId) {
    throw new Error("No puedes eliminarte a ti mismo.");
  }

  await prisma.member.delete({ where: { id: target.id } });

  return { success: true, removed: target.user.email };
};
