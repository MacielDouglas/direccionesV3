"use server";

import { createOrganizationService } from "@/domains/organization";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireOrgAdminOrOwner } from "@/server/users";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

const organizationIdSchema = z.string().uuid();
const tokenSchema = z.string().min(1);

async function requireSuperUser() {
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.isSuperUser) {
    throw new Error("No autorizado.");
  }
  return currentUser;
}

// ── Gera token de convite — apenas admin/owner ─────────────────
export async function createInviteTokenAction(data: {
  organizationId: string;
  orgSlug: string;
}) {
  if (!organizationIdSchema.safeParse(data.organizationId).success) {
    throw new Error("Organización inválida.");
  }

  const userData = await requireOrgAdminOrOwner(data.organizationId);

  await prisma.inviteToken.updateMany({
    where: {
      type: "INVITE",
      organizationId: data.organizationId,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { expiresAt: new Date() },
  });

  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

  const token = await prisma.inviteToken.create({
    data: {
      type: "INVITE",
      organizationId: data.organizationId,
      role: "member",
      createdById: userData.user.id,
      expiresAt,
    },
  });

  revalidatePath(`/org/${data.orgSlug}/admin/invitations`);
  return token;
}

// ── Usa token de convite — qualquer usuário logado sem org ─────
export async function applyInviteTokenAction(token: string) {
  if (!tokenSchema.safeParse(token).success) throw new Error("Enlace no válido.");

  const userData = await getCurrentUser();
  if (!userData) throw new Error("No autorizado.");

  const invite = await prisma.inviteToken.findUnique({
    where: { token },
    include: { organization: true },
  });

  if (!invite || invite.type !== "INVITE") throw new Error("Enlace no válido.");
  if (invite.usedAt) throw new Error("Este enlace ya fue utilizado.");
  if (invite.expiresAt < new Date()) throw new Error("Este enlace expiró.");
  if (!invite.organizationId || !invite.organization) throw new Error("Enlace no válido.");

  const membershipCount = await prisma.member.count({
    where: { userId: userData.user.id },
  });

  if (membershipCount > 0) {
    throw new Error("Solo puedes pertenecer a una organización.");
  }

  const alreadyMember = await prisma.member.findFirst({
    where: {
      userId: userData.user.id,
      organizationId: invite.organizationId,
    },
  });
  if (alreadyMember) throw new Error("Ya eres miembro de esta organización.");

  const reqHeaders = await headers();

  // ✅ Adiciona como member via better-auth
  await auth.api.addMember({
    body: {
      userId: userData.user.id,
      organizationId: invite.organizationId,
      role: "member",
    },
    headers: reqHeaders,
  });

  // ✅ Atualiza lastActiveAt
  await prisma.member.updateMany({
    where: {
      userId: userData.user.id,
      organizationId: invite.organizationId,
    },
    data: { lastActiveAt: new Date() },
  });

  // ✅ Marca token como usado
  await prisma.inviteToken.update({
    where: { token },
    data: { usedAt: new Date(), usedByUserId: userData.user.id },
  });

  // ❌ setActiveOrganization REMOVIDO — não propaga cookie em Server Action
  // Será chamado no cliente via authClient após este retorno
  return invite.organization;
}

// ── Gera token de onboarding (owner) — apenas Super User ────────
export async function createOwnerOnboardingTokenAction() {
  const currentUser = await requireSuperUser();

  await prisma.inviteToken.updateMany({
    where: {
      type: "OWNER_ONBOARDING",
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { expiresAt: new Date() },
  });

  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 dias

  const token = await prisma.inviteToken.create({
    data: {
      type: "OWNER_ONBOARDING",
      role: "owner",
      createdById: currentUser.user.id,
      expiresAt,
    },
  });

  revalidatePath("/");
  return token;
}

// ── Cria organização usando token de onboarding (owner) ────────
export async function redeemOwnerOnboardingTokenAction(data: {
  token: string;
  name: string;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("No autorizado.");
  if (currentUser.isSuperUser) {
    throw new Error("El super usuario no crea organizaciones.");
  }

  const result = await createOrganizationService(data, {
    userId: currentUser.user.id,
  });

  return result;
}

// ── Tela de boas-vindas: aceita token de onboarding OU de convite ─
export async function redeemWelcomeTokenAction(data: { token: string; name?: string }) {
  if (!tokenSchema.safeParse(data.token).success) throw new Error("Token no válido.");

  const invite = await prisma.inviteToken.findUnique({ where: { token: data.token } });

  if (!invite) throw new Error("Token no válido.");
  if (invite.usedAt) throw new Error("Este token ya fue utilizado.");
  if (invite.expiresAt < new Date()) throw new Error("Este token expiró.");

  if (invite.type === "OWNER_ONBOARDING") {
    const name = data.name?.trim();
    if (!name || name.length < 2) {
      throw new Error("Ingresa el nombre de tu organización.");
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("No autorizado.");
    if (currentUser.isSuperUser) {
      throw new Error("El super usuario no crea organizaciones.");
    }

    const org = await createOrganizationService(
      { token: data.token, name },
      { userId: currentUser.user.id },
    );

    return { kind: "owner" as const, org };
  }

  const org = await applyInviteTokenAction(data.token);

  return { kind: "invite" as const, org };
}

// ── Lista tokens de onboarding — apenas Super User ─────────────
export async function getOwnerOnboardingTokensAction() {
  await requireSuperUser();

  return prisma.inviteToken.findMany({
    where: { type: "OWNER_ONBOARDING" },
    include: {
      createdBy: { select: { name: true } },
      usedBy: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

// ── Lista tokens da org — apenas admin/owner ────────────────────
export async function getOrgInviteTokensAction(organizationId: string) {
  if (!organizationIdSchema.safeParse(organizationId).success) {
    throw new Error("Organización inválida.");
  }

  await requireOrgAdminOrOwner(organizationId);

  return prisma.inviteToken.findMany({
    where: { organizationId, type: "INVITE" },
    include: {
      createdBy: { select: { name: true } },
      usedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}
