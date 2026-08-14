"use server";

import { toRole } from "@/domains/member/utils/toRole";
import { auth } from "@/lib/auth";
import { type AppRole, canAccess } from "@/lib/autorize";
import type { Locale } from "@/lib/i18n/types";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

// ✅ Idioma persistido do usuário no banco (fallback quando não há cookie)
export const getUserLanguage = cache(async (): Promise<Locale | null> => {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { language: true },
  });

  return user?.language === "pt" || user?.language === "es" ? user.language : null;
});

export const getCurrentUser = cache(async () => {
  const reqHeaders = await headers();

  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) return null;

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isSuperUser: true,
      language: true,
      createdAt: true,
      person: {
        select: {
          id: true,
          organizationId: true,
          name: true,
          role: true,
          lastActiveAt: true,
        },
      },
    },
  });

  if (!currentUser) return null;

  // ✅ Garantia: todo usuário autenticado possui sua Person (1:1)
  let person = currentUser.person;
  if (!person) {
    person = await prisma.person.create({
      data: {
        name: currentUser.name,
        role: null,
        userId: currentUser.id,
      },
    });
  }

  if (currentUser.isSuperUser) {
    return {
      session,
      user: currentUser,
      person,
      memberRole: null,
      activeOrganization: null,
      isSuperUser: true,
    };
  }

  const activeOrganization = person.organizationId
    ? await prisma.organization.findUnique({
        where: { id: person.organizationId },
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          logo: true,
        },
      })
    : null;

  const memberRole = person.role ? { role: toRole(person.role) } : null;

  return {
    session,
    user: currentUser,
    person,
    memberRole,
    activeOrganization,
    isSuperUser: false,
  };
});

export const getUniquePerson = cache(async (personId: string) => {
  if (!personId) return null;
  return prisma.person.findUnique({
    where: { id: personId },
    select: {
      id: true,
      name: true,
      organizationId: true,
      role: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          isSuperUser: true,
        },
      },
    },
  });
});

// ✅ Pessoas disponíveis para entrar em uma organização (person sem organização vinculada)
export const getUnlinkedPersons = async (_organizationId: string) => {
  try {
    return prisma.person.findMany({
      where: {
        organizationId: null,
        user: { isSuperUser: false },
      },
      select: {
        id: true,
        name: true,
        role: true,
        organizationId: true,
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { name: "asc" },
    });
  } catch {
    return [];
  }
};

// ✅ Pessoas de uma organização (com ou sem usuário vinculado)
export const getOrgPersons = async (organizationId: string) => {
  return prisma.person.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      role: true,
      organizationId: true,
      user: { select: { id: true, name: true, email: true, image: true, isSuperUser: true } },
    },
    orderBy: { name: "asc" },
  });
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
  if (!data.isSuperUser && !data.person?.organizationId) {
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

// ✅ Helper central — exige pessoa vinculada à organização informada (Super User acessa tudo)
export async function requireOrgMember(organizationId: string): Promise<AuthContext> {
  const data = await getCurrentUser();
  if (!data) throw new Error("No autenticado.");

  if (data.isSuperUser) return data;

  const person = await prisma.person.findFirst({
    where: { organizationId, userId: data.user.id },
    select: { id: true },
  });
  if (!person) throw new Error("Sin permiso para esta organización.");

  return data;
}

// ✅ Helper central — exige role admin/owner na organização informada (Super User fica isento)
export async function requireOrgAdminOrOwner(organizationId: string): Promise<AuthContext> {
  const data = await requireOrgMember(organizationId);
  if (data.isSuperUser) return data;

  const person = await prisma.person.findFirst({
    where: { organizationId, userId: data.user.id },
    select: { role: true },
  });

  const role = toRole(person?.role ?? null);
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
