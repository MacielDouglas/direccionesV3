"use server";

import { toRole } from "@/domains/member/utils/toRole";
import { auth } from "@/lib/auth";
import { type AppRole, canAccess } from "@/lib/autorize";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

export const getCurrentUser = cache(async () => {
  const reqHeaders = await headers();

  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) return null;

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true, isSuperUser: true, createdAt: true },
  });

  if (!currentUser) return null;

  if (currentUser.isSuperUser) {
    return {
      session,
      user: currentUser,
      activeMember: null,
      memberRole: null,
      activeOrganization: null,
      isSuperUser: true,
    };
  }

  const membership = await prisma.member.findFirst({
    where: { userId: currentUser.id },
    orderBy: { lastActiveAt: "desc" },
    select: { id: true, organizationId: true, role: true },
  });

  const activeMember = membership
    ? {
        id: membership.id,
        organizationId: membership.organizationId,
        role: toRole(membership.role),
      }
    : null;

  const activeOrganization = activeMember
    ? await prisma.organization.findUnique({
        where: { id: activeMember.organizationId },
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          logo: true,
        },
      })
    : null;

  const memberRole = activeMember ? { role: activeMember.role } : null;

  return {
    session,
    user: currentUser,
    activeMember,
    memberRole,
    activeOrganization,
    isSuperUser: false,
  };
});

export const getUniqueUser = cache(async (userId: string) => {
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
    },
  });
});

export const getNonMemberUsers = async (organizationId: string) => {
  try {
    return prisma.user.findMany({
      where: {
        members: { none: { organizationId } },
      },
      select: { id: true, name: true, email: true, image: true, role: true },
      orderBy: { name: "asc" },
    });
  } catch {
    return [];
  }
};

export const requireSession = async () => {
  const data = await getCurrentUser();
  if (!data) redirect("/login");
  return data.session;
};

type AuthContext = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

// ✅ Helper central — exige sessão autenticada com organização ativa (Super User fica isento)
export async function requireAuthContext(): Promise<AuthContext> {
  const data = await getCurrentUser();
  if (!data) throw new Error("No autenticado.");
  if (!data.isSuperUser && !data.activeMember?.organizationId) {
    throw new Error("Sin organización activa.");
  }
  return data;
}

// ✅ Helper central — exige role admin/owner na organização ativa (Super User fica isento)
export async function requireAdminOrOwner(): Promise<AuthContext> {
  const data = await requireAuthContext();
  if (data.isSuperUser) return data;
  const role = data.memberRole?.role;
  if (!role || !canAccess(role, "admin")) throw new Error("Sin permiso.");
  return data;
}

// ✅ Helper central — exige membro da organização (por organizationId); Super User acessa tudo
export async function requireOrgMember(organizationId: string): Promise<AuthContext> {
  const data = await getCurrentUser();
  if (!data) throw new Error("No autenticado.");

  if (data.isSuperUser) return data;

  const member = await prisma.member.findFirst({
    where: { organizationId, userId: data.user.id },
    select: { id: true },
  });
  if (!member) throw new Error("Sin permiso para esta organización.");

  return data;
}

// ✅ Helper central — exige role admin/owner na organização informada (Super User fica isento)
export async function requireOrgAdminOrOwner(organizationId: string): Promise<AuthContext> {
  const data = await requireOrgMember(organizationId);
  if (data.isSuperUser) return data;

  const member = await prisma.member.findFirst({
    where: { organizationId, userId: data.user.id },
    select: { role: true },
  });

  const role = toRole(member?.role ?? null);
  if (!role || !canAccess(role, "admin")) throw new Error("Sin permiso.");

  return data;
}

// ✅ Helper central — exige role mínimo na organização ativa (Super User fica isento)
export async function requireRole(required: AppRole): Promise<AuthContext> {
  const data = await requireAuthContext();
  if (data.isSuperUser) return data;
  const role = data.memberRole?.role;
  if (!role || !canAccess(role, required)) throw new Error("Sin permiso.");
  return data;
}
