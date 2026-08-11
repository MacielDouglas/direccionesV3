"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireOrgAdminOrOwner } from "@/server/users";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

const organizationIdSchema = z.string().uuid();
const invitationIdSchema = z.string().min(1);

export async function createInvitationAction(data: {
  email: string;
  role: "member" | "admin";
  organizationId: string;
  orgSlug: string;
}) {
  const reqHeaders = await headers();

  if (!organizationIdSchema.safeParse(data.organizationId).success) {
    throw new Error("Organización inválida.");
  }

  await requireOrgAdminOrOwner(data.organizationId);

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
}

export async function cancelInvitationAction(invitationId: string, orgSlug: string) {
  const reqHeaders = await headers();

  if (!invitationIdSchema.safeParse(invitationId).success) {
    throw new Error("Invitación inválida.");
  }

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    select: { organizationId: true },
  });
  if (!invitation) throw new Error("Invitación no encontrada.");

  await requireOrgAdminOrOwner(invitation.organizationId);

  await auth.api.cancelInvitation({
    body: { invitationId },
    headers: reqHeaders,
  });

  revalidatePath(`/org/${orgSlug}/admin/invitations`);
}

export async function getOrganizationInvitationsAction(organizationId: string) {
  if (!organizationIdSchema.safeParse(organizationId).success) {
    throw new Error("Organización inválida.");
  }

  await requireOrgAdminOrOwner(organizationId);

  return prisma.invitation.findMany({
    where: { organizationId },
    include: {
      inviter: { select: { name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
