"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/users";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// ── Gera token — apenas admin/owner ──────────────────────────
export async function createInviteTokenAction(data: {
  organizationId: string;
  orgSlug: string;
}) {
  const userData = await getCurrentUser();
  if (!userData) throw new Error("No autorizado.");

  const role = userData.memberRole?.role;
  if (!role || !["admin", "owner"].includes(role)) {
    throw new Error("Sin permiso para generar invitaciones.");
  }

  // Invalida tokens anteriores não usados da mesma org
  await prisma.inviteToken.updateMany({
    where: {
      organizationId: data.organizationId,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { expiresAt: new Date() }, // expira imediatamente
  });

  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

  const token = await prisma.inviteToken.create({
    data: {
      organizationId: data.organizationId,
      role: "member", // ✅ sempre member
      createdById: userData.user.id,
      expiresAt,
    },
  });

  revalidatePath(`/org/${data.orgSlug}/admin/invitations`);
  return token;
}

// ── Usa token — qualquer usuário logado ──────────────────────
export async function applyInviteTokenAction(token: string) {
  const userData = await getCurrentUser();
  if (!userData) throw new Error("No autorizado.");

  const invite = await prisma.inviteToken.findUnique({
    where: { token },
    include: { organization: true },
  });

  if (!invite) throw new Error("Enlace no válido.");
  if (invite.usedAt) throw new Error("Este enlace ya fue utilizado.");
  if (invite.expiresAt < new Date()) throw new Error("Este enlace expiró.");

  const alreadyMember = await prisma.member.findFirst({
    where: {
      userId: userData.user.id,
      organizationId: invite.organizationId,
    },
  });
  if (alreadyMember) throw new Error("Ya eres miembro de esta organización.");

  const reqHeaders = await headers();

  // ✅ Adiciona como member
  await auth.api.addMember({
    body: {
      userId: userData.user.id,
      organizationId: invite.organizationId,
      role: "member",
    },
    headers: reqHeaders,
  });

  // ✅ Seta a org como ativa na sessão imediatamente
  await auth.api.setActiveOrganization({
    body: { organizationId: invite.organizationId },
    headers: reqHeaders,
  });

  // ✅ Atualiza lastActiveAt do member
  await prisma.member.updateMany({
    where: {
      userId: userData.user.id,
      organizationId: invite.organizationId,
    },
    data: { lastActiveAt: new Date() },
  });

  // Marca token como usado
  await prisma.inviteToken.update({
    where: { token },
    data: { usedAt: new Date(), usedByUserId: userData.user.id },
  });

  return invite.organization;
}

// ── Lista tokens da org ──────────────────────────────────────
export async function getOrgInviteTokensAction(organizationId: string) {
  return prisma.inviteToken.findMany({
    where: { organizationId },
    include: {
      createdBy: { select: { name: true } },
      usedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10, // últimos 10
  });
}
