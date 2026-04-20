"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { toRole } from "@/domains/member/utils/toRole";

export const getCurrentUser = cache(async () => {
  const reqHeaders = await headers();

  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) return null;

  let activeMemberRaw = null;
  try {
    activeMemberRaw = await auth.api.getActiveMember({ headers: reqHeaders });
  } catch {
    activeMemberRaw = null;
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  if (!currentUser) return null;

  const [memberRoleRaw, activeOrganization] = await Promise.all([
    activeMemberRaw
      ? auth.api.getActiveMemberRole({ headers: reqHeaders }).catch(() => null)
      : Promise.resolve(null),
    activeMemberRaw
      ? prisma.organization.findUnique({
          where: { id: activeMemberRaw.organizationId },
          select: {
            id: true,
            name: true,
            slug: true,
            createdAt: true,
            logo: true,
          },
        })
      : Promise.resolve(null),
  ]);

  const activeMember = activeMemberRaw
    ? { ...activeMemberRaw, role: toRole(activeMemberRaw.role) }
    : null;

  const memberRole = memberRoleRaw
    ? { ...memberRoleRaw, role: toRole(memberRoleRaw.role) }
    : null;

  return {
    session,
    user: currentUser,
    activeMember,
    memberRole,
    activeOrganization,
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
  } catch (error) {
    console.error("[getNonMemberUsers]", error);
    return [];
  }
};

export const requireSession = async () => {
  const data = await getCurrentUser();
  if (!data) redirect("/login");
  return data.session;
};