"use server";

import { createOrganizationService } from "@/domains/organization";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireOrgAdminOrOwner } from "@/server/users";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const organizationIdSchema = z.string().min(1);
const tokenSchema = z.string().min(1);
const TOKEN_VALIDITY_MS = 1000 * 60 * 60 * 24 * 3; // 72 horas

// Token numérico de 6 dígitos, sem colisão com tokens existentes.
async function generateNumericToken(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = String(Math.floor(100000 + Math.random() * 900000));
    const existing = await prisma.inviteToken.findUnique({
      where: { token: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  throw new Error("No se pudo generar un token único. Intenta nuevamente.");
}

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
  personId?: string;
}) {
  if (!organizationIdSchema.safeParse(data.organizationId).success) {
    throw new Error("Organización inválida.");
  }

  const userData = await requireOrgAdminOrOwner(data.organizationId);

  if (data.personId) {
    const person = await prisma.person.findFirst({
      where: { id: data.personId, organizationId: data.organizationId },
    });
    if (!person) throw new Error("Persona no encontrada.");
    if (person.userId) throw new Error("Esta persona ya tiene un usuario vinculado.");
  }

  // Convites de pessoas são individuais — não invalidam os demais.
  if (!data.personId) {
    await prisma.inviteToken.updateMany({
      where: {
        type: "INVITE",
        organizationId: data.organizationId,
        personId: null,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { expiresAt: new Date() },
    });
  }

  const expiresAt = new Date(Date.now() + TOKEN_VALIDITY_MS); // 72 horas

  const token = await prisma.inviteToken.create({
    data: {
      type: "INVITE",
      organizationId: data.organizationId,
      role: "member",
      createdByPersonId: userData.person.id,
      personId: data.personId ?? null,
      token: await generateNumericToken(),
      expiresAt,
    },
  });

  revalidatePath(`/org/${data.orgSlug}/admin/invitations`);
  revalidatePath(`/org/${data.orgSlug}/admin/pessoas`);
  return token;
}

// ── Usa token de convite — qualquer usuário logado ─────────────
export async function applyInviteTokenAction(token: string) {
  if (!tokenSchema.safeParse(token).success) throw new Error("Enlace no válido.");

  const userData = await getCurrentUser();
  if (!userData) throw new Error("No autorizado.");

  const invite = await prisma.inviteToken.findUnique({
    where: { token },
    include: { organization: true, person: true },
  });

  if (!invite || invite.type !== "INVITE") throw new Error("Enlace no válido.");
  if (invite.usedAt) throw new Error("Este enlace ya fue utilizado.");
  if (invite.expiresAt < new Date()) throw new Error("Este enlace expiró.");
  if (!invite.organizationId || !invite.organization) throw new Error("Enlace no válido.");

  if (userData.person.organizationId) {
    throw new Error("Ya perteneces a una organización.");
  }

  // Convite vinculado a uma Pessoa pré-criada: o usuário assume aquela Pessoa.
  if (invite.personId) {
    const person = invite.person;
    if (!person) throw new Error("Enlace no válido.");
    if (person.userId) throw new Error("Esta persona ya tiene un usuario vinculado.");

    await prisma.$transaction(async (tx) => {
      // Remove a Person auto-criada do usuário (sem org e sem dados).
      if (userData.person.id !== person.id) {
        await tx.person.deleteMany({
          where: { id: userData.person.id, organizationId: null, userId: userData.user.id },
        });
      }

      await tx.person.update({
        where: { id: person.id },
        data: {
          userId: userData.user.id,
          lastActiveAt: new Date(),
        },
      });

      await tx.inviteToken.update({
        where: { token },
        data: { usedAt: new Date(), usedByPersonId: person.id },
      });
    });

    return invite.organization;
  }

  // Convite genérico: a Person do próprio usuário entra na organização.
  await prisma.$transaction(async (tx) => {
    const updated = await tx.person.update({
      where: { id: userData.person.id },
      data: {
        organizationId: invite.organizationId,
        role: invite.role,
        lastActiveAt: new Date(),
      },
    });

    await tx.inviteToken.update({
      where: { token },
      data: { usedAt: new Date(), usedByPersonId: updated.id },
    });
  });

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
      createdByPersonId: currentUser.person.id,
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

// ── Tela de boas-vindas: aceita token de convite OU de onboarding ─
export type WelcomeResult =
  | { kind: "owner_needs_name" }
  | { kind: "owner"; org: { name: string } }
  | { kind: "invite"; org: { name: string } }
  | {
      kind: "error";
      code: "invalid" | "used" | "expired" | "already_in_org" | "unauthorized" | "other";
    };

export async function redeemWelcomeTokenAction(data: {
  token: string;
  name?: string;
}): Promise<WelcomeResult> {
  if (!tokenSchema.safeParse(data.token).success) {
    return { kind: "error", code: "invalid" };
  }

  const invite = await prisma.inviteToken.findUnique({ where: { token: data.token } });

  if (!invite) return { kind: "error", code: "invalid" };
  if (invite.usedAt) return { kind: "error", code: "used" };
  if (invite.expiresAt < new Date()) return { kind: "error", code: "expired" };

  if (invite.type === "OWNER_ONBOARDING") {
    // Sem nome da organização ainda → pede para o usuário digitar.
    const name = data.name?.trim();
    if (!name || name.length < 2) {
      return { kind: "owner_needs_name" };
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) return { kind: "error", code: "unauthorized" };
    if (currentUser.isSuperUser) return { kind: "error", code: "other" };

    const org = await createOrganizationService(
      { token: data.token, name },
      { userId: currentUser.user.id },
    );

    return { kind: "owner", org };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) return { kind: "error", code: "unauthorized" };
  if (currentUser.person.organizationId) return { kind: "error", code: "already_in_org" };

  const org = await applyInviteTokenAction(data.token);

  return { kind: "invite", org };
}

// ── Lista tokens de onboarding — apenas Super User ─────────────
export async function getOwnerOnboardingTokensAction() {
  await requireSuperUser();

  return prisma.inviteToken.findMany({
    where: { type: "OWNER_ONBOARDING" },
    include: {
      createdBy: { select: { name: true } },
      usedBy: { select: { name: true, user: { select: { email: true } } } },
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
