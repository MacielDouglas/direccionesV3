"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { getCurrentUser } from "@/server/users";
import { revalidatePath } from "next/cache";

export async function createInvitationAction(data: {
  email: string;
  role: "member" | "admin";
  organizationId: string;
  orgSlug: string;
}) {
  try {
    const reqHeaders = await headers();
    const userData = await getCurrentUser();

    if (!userData) throw new Error("No autorizado.");

    const role = userData.memberRole?.role;
    if (!role || !["admin", "owner"].includes(role)) {
      throw new Error(`Sin permiso. Role: ${role}`);
    }

    // ✅ Garante que a sessão tem a org correta como ativa
    await auth.api.setActiveOrganization({
      body: { organizationId: data.organizationId },
      headers: reqHeaders,
    });

    const alreadyMember = await prisma.member.findFirst({
      where: {
        organizationId: data.organizationId,
        user: { email: data.email },
      },
    });
    if (alreadyMember) throw new Error("Este usuario ya es miembro.");

    await prisma.invitation.updateMany({
      where: {
        organizationId: data.organizationId,
        email: data.email,
        status: "pending",
      },
      data: { status: "canceled" },
    });

    const invitation = await auth.api.createInvitation({
      body: {
        email: data.email,
        role: data.role,
        organizationId: data.organizationId,
      },
      headers: reqHeaders,
    });

    revalidatePath(`/org/${data.orgSlug}/admin/invitations`);
    return invitation;
  } catch (error) {
    console.error("[createInvitationAction]", error);
    throw error;
  }
}

export async function cancelInvitationAction(
  invitationId: string,
  orgSlug: string,
) {
  const reqHeaders = await headers();

  await auth.api.cancelInvitation({
    body: { invitationId },
    headers: reqHeaders,
  });

  revalidatePath(`/org/${orgSlug}/admin/invitations`);
}

export async function getOrganizationInvitationsAction(organizationId: string) {
  return prisma.invitation.findMany({
    where: { organizationId },
    include: {
      inviter: { select: { name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
