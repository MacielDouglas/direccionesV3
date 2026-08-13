"use server";

import type { Role } from "@/domains/member/types/role.types";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/users";
import { revalidatePath } from "next/cache";

const canManageRequester = (role: string | undefined | null) =>
  role === "owner" || role === "admin";

// ✅ Vincular uma person desvinculada a uma organização
export const linkPersonToOrganization = async (
  personId: string,
  organizationId: string,
  slug: string,
  role: Role,
) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("No autenticado.");

  if (!currentUser.isSuperUser) {
    if (currentUser.person?.organizationId !== organizationId) {
      throw new Error("Sin permiso.");
    }
    const requesterRole = currentUser.person?.role;
    if (!canManageRequester(requesterRole)) {
      throw new Error("Sin permiso.");
    }
  }

  const person = await prisma.person.findUnique({
    where: { id: personId },
    select: { organizationId: true, name: true },
  });
  if (!person) throw new Error("Persona no encontrada.");
  if (person.organizationId) {
    throw new Error("Esta persona ya pertenece a una organización.");
  }

  await prisma.person.update({
    where: { id: personId },
    data: { organizationId, role, lastActiveAt: new Date() },
  });

  revalidatePath(`/org/${slug}/admin/pessoas`);
};

// ✅ Atualizar o papel de uma persona na organização
export const updatePersonRole = async (
  organizationId: string,
  personId: string,
  role: Role,
  slug?: string,
) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("No autenticado.");

  const target = await prisma.person.findFirst({
    where: { id: personId, organizationId },
    select: { id: true, role: true, userId: true },
  });
  if (!target) throw new Error("Persona no encontrada.");

  if (!currentUser.isSuperUser) {
    const requester = await prisma.person.findFirst({
      where: { organizationId, userId: currentUser.user.id },
      select: { role: true },
    });
    if (!requester || !canManageRequester(requester.role)) {
      throw new Error("Sin permiso para modificar roles.");
    }

    if (requester.role === "admin") {
      if (target.role === "owner" || role === "owner") {
        throw new Error("Solo el owner puede gestionar owners.");
      }
    }

    if (target.role === "owner" && role !== "owner") {
      const ownerCount = await prisma.person.count({
        where: { organizationId, role: "owner" },
      });
      if (ownerCount <= 1) throw new Error("No puedes quitar el único owner.");
    }
  }

  await prisma.person.update({
    where: { id: target.id },
    data: { role },
  });

  if (slug) revalidatePath(`/org/${slug}/admin/pessoas`);
};

// ✅ Transferir a ownership para outra persona (owner → novo owner)
export const transferOwnership = async (
  organizationId: string,
  currentOwnerPersonId: string,
  newOwnerPersonId: string,
  slug: string,
) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("No autenticado.");

  const reqPerson = await prisma.person.findFirst({
    where: { organizationId, userId: currentUser.user.id },
    select: { role: true },
  });
  const isOwner = currentUser.isSuperUser || reqPerson?.role === "owner";
  if (!isOwner) throw new Error("Solo el owner puede transferir la ownership.");

  const currentOwner = await prisma.person.findUnique({
    where: { id: currentOwnerPersonId },
    select: { id: true, role: true },
  });
  const newOwner = await prisma.person.findFirst({
    where: { id: newOwnerPersonId, organizationId },
    select: { id: true },
  });
  if (!newOwner) throw new Error("La persona destinataria no pertenece a esta organización.");
  if (currentOwner?.role !== "owner") throw new Error("La persona actual no es owner.");

  await prisma.$transaction([
    prisma.person.update({
      where: { id: currentOwnerPersonId },
      data: { role: "admin" },
    }),
    prisma.person.update({
      where: { id: newOwnerPersonId },
      data: { role: "owner" },
    }),
  ]);

  revalidatePath(`/org/${slug}/admin/pessoas`);
};

// ✅ Remover uma persona da organização (preserva a person, apenas desvincula)
export const removePersonFromOrganization = async (
  organizationId: string,
  personIdOrEmail: string,
) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("No autenticado.");

  const requester = await prisma.person.findFirst({
    where: { organizationId, userId: currentUser.user.id },
    select: { role: true },
  });
  const requesterRole = currentUser.isSuperUser ? "owner" : requester?.role;
  if (!requesterRole || requesterRole === "member") {
    throw new Error("Los miembros no pueden eliminar a otros miembros.");
  }

  const target = await prisma.person.findFirst({
    where: {
      organizationId,
      OR: [{ id: personIdOrEmail }, { user: { email: personIdOrEmail } }],
    },
    include: { user: { select: { email: true } } },
  });

  if (!target) {
    throw new Error("Persona no encontrada en la organización.");
  }

  if (!currentUser.isSuperUser && target.role === "owner") {
    if (requesterRole === "admin") {
      throw new Error("Los administradores no pueden eliminar al owner.");
    }
    const ownerCount = await prisma.person.count({
      where: { organizationId, role: "owner" },
    });
    if (ownerCount <= 1) throw new Error("No puedes quitar el único owner.");
  }

  if (target.userId === currentUser.user.id) {
    throw new Error("No puedes eliminarte a ti mismo.");
  }

  // ✅ Sempre: desatribui cards atribuídos a ela (ficam livres na mesma org)
  await prisma.card.updateMany({
    where: { assignedPersonId: target.id, organizationId },
    data: { assignedPersonId: null },
  });

  if (target.role === "member") {
    // ✅ Membro comum: libera a ownership dos cards e a condução de eventos
    await prisma.card.updateMany({
      where: { ownerPersonId: target.id, organizationId },
      data: { ownerPersonId: null },
    });
    await prisma.agendaEvent.updateMany({
      where: { conductorPersonId: target.id, organizationId },
      data: { conductorPersonId: null },
    });
  }
  // Admin/owner: ownership de cards e condução da agenda são mantidos

  await prisma.address.updateMany({
    where: { invitedByPersonId: target.id, organizationId },
    data: { invitedByPersonId: null },
  });

  await prisma.person.update({
    where: { id: target.id },
    data: { organizationId: null, role: null, lastActiveAt: new Date() },
  });

  return { success: true, removed: target.user?.email ?? target.name };
};

// ✅ Criar uma Pessoa na organização + convite vinculado a ela
export const createOrgPersonAction = async (organizationId: string, name: string, slug: string) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("No autenticado.");

  if (!currentUser.isSuperUser) {
    if (currentUser.person?.organizationId !== organizationId) {
      throw new Error("Sin permiso.");
    }
    if (!canManageRequester(currentUser.person?.role)) {
      throw new Error("Sin permiso.");
    }
  }

  const parsedName = name.trim();
  if (parsedName.length < 2) {
    throw new Error("El nombre debe tener al menos 2 caracteres.");
  }

  const person = await prisma.$transaction(async (tx) => {
    const newPerson = await tx.person.create({
      data: {
        name: parsedName,
        organizationId,
        role: "member",
      },
    });

    await tx.inviteToken.create({
      data: {
        type: "INVITE",
        organizationId,
        role: "member",
        createdByPersonId: currentUser.person.id,
        personId: newPerson.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });

    return newPerson;
  });

  revalidatePath(`/org/${slug}/admin/pessoas`);
  return person;
};

// ✅ Regenerar o convite de uma Pessoa (invalida os anteriores)
export const regeneratePersonInviteAction = async (
  organizationId: string,
  personId: string,
  slug: string,
) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("No autenticado.");

  if (!currentUser.isSuperUser) {
    if (currentUser.person?.organizationId !== organizationId) {
      throw new Error("Sin permiso.");
    }
    if (!canManageRequester(currentUser.person?.role)) {
      throw new Error("Sin permiso.");
    }
  }

  const person = await prisma.person.findFirst({
    where: { id: personId, organizationId },
    select: { id: true, userId: true },
  });
  if (!person) throw new Error("Persona no encontrada.");
  if (person.userId) throw new Error("Esta persona ya tiene un usuario vinculado.");

  const token = await prisma.$transaction(async (tx) => {
    await tx.inviteToken.updateMany({
      where: { type: "INVITE", personId, usedAt: null, expiresAt: { gt: new Date() } },
      data: { expiresAt: new Date() },
    });

    return tx.inviteToken.create({
      data: {
        type: "INVITE",
        organizationId,
        role: "member",
        createdByPersonId: currentUser.person.id,
        personId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });
  });

  revalidatePath(`/org/${slug}/admin/pessoas`);
  return token;
};

// ✅ Pessoas da organização com o convite válido de cada uma
export const getOrgPersonsWithInvites = async (organizationId: string) => {
  const persons = await prisma.person.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      role: true,
      organizationId: true,
      userId: true,
      user: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { name: "asc" },
  });

  const invites = await prisma.inviteToken.findMany({
    where: {
      type: "INVITE",
      organizationId,
      personId: { not: null },
    },
    orderBy: { createdAt: "desc" },
    select: { token: true, personId: true, usedAt: true, expiresAt: true },
  });

  const inviteByPerson = new Map<string, (typeof invites)[number]>();
  for (const invite of invites) {
    if (!invite.personId) continue;
    if (!inviteByPerson.has(invite.personId)) inviteByPerson.set(invite.personId, invite);
  }

  return persons.map((person) => {
    const invite = inviteByPerson.get(person.id) ?? null;
    const valid = invite && !invite.usedAt && invite.expiresAt > new Date();
    return {
      ...person,
      inviteToken: valid ? invite.token : null,
      inviteExpired: invite ? !valid : false,
    };
  });
};

// ✅ Buscar usuários sem pessoa vinculada para vincular a uma persona
export const searchUsersToLinkAction = async (organizationId: string, query: string) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("No autenticado.");

  if (!currentUser.isSuperUser) {
    if (currentUser.person?.organizationId !== organizationId) {
      throw new Error("Sin permiso.");
    }
    if (!canManageRequester(currentUser.person?.role)) {
      throw new Error("Sin permiso.");
    }
  }

  const q = query.trim();
  if (q.length < 2) return [];

  return prisma.user.findMany({
    where: {
      person: { is: null },
      isSuperUser: false,
      OR: [
        { email: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, email: true, image: true },
    orderBy: { name: "asc" },
    take: 10,
  });
};

// ✅ Vincular um usuário existente a uma persona sem usuário
export const linkUserToPersonAction = async (
  organizationId: string,
  personId: string,
  userId: string,
  slug: string,
) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("No autenticado.");

  if (!currentUser.isSuperUser) {
    if (currentUser.person?.organizationId !== organizationId) {
      throw new Error("Sin permiso.");
    }
    if (!canManageRequester(currentUser.person?.role)) {
      throw new Error("Sin permiso.");
    }
  }

  const person = await prisma.person.findFirst({
    where: { id: personId, organizationId },
    select: { id: true, userId: true },
  });
  if (!person) throw new Error("Persona no encontrada.");
  if (person.userId) throw new Error("Esta persona ya tiene un usuario vinculado.");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true },
  });
  if (!user) throw new Error("Usuario no encontrado.");

  const existing = await prisma.person.findUnique({ where: { userId: user.id } });
  if (existing) throw new Error("Este usuario ya está vinculado a otra persona.");

  await prisma.person.update({
    where: { id: person.id },
    data: { userId: user.id, name: user.name },
  });

  revalidatePath(`/org/${slug}/admin/pessoas`);
  return { success: true };
};

// ✅ Excluir uma persona permanentemente (preserva referências e contas vinculadas)
export const deletePersonAction = async (
  organizationId: string,
  personId: string,
  slug: string,
) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("No autenticado.");

  const requester = currentUser.isSuperUser
    ? null
    : await prisma.person.findFirst({
        where: { organizationId, userId: currentUser.user.id },
        select: { id: true, role: true },
      });
  const requesterRole = currentUser.isSuperUser ? "owner" : requester?.role;
  if (!requesterRole || requesterRole === "member") {
    throw new Error("Los miembros no pueden eliminar a otras personas.");
  }

  const target = await prisma.person.findFirst({
    where: { id: personId, organizationId },
    select: { id: true, userId: true, role: true },
  });
  if (!target) throw new Error("Persona no encontrada.");
  if (target.userId) throw new Error("Desvincula el usuario antes de eliminar la persona.");
  if (requesterRole === "admin" && target.role === "owner") {
    throw new Error("Los administradores no pueden eliminar al owner.");
  }

  const requesterPersonId = currentUser.person.id;

  await prisma.$transaction(async (tx) => {
    await tx.card.updateMany({
      where: { organizationId, assignedPersonId: target.id },
      data: { assignedPersonId: null },
    });
    await tx.card.updateMany({
      where: { organizationId, ownerPersonId: target.id },
      data: { ownerPersonId: null },
    });
    await tx.card.updateMany({
      where: { organizationId, createdByPersonId: target.id },
      data: { createdByPersonId: requesterPersonId },
    });
    await tx.card.updateMany({
      where: { organizationId, updatedByPersonId: target.id },
      data: { updatedByPersonId: null },
    });
    await tx.cardEvent.updateMany({
      where: { personId: target.id },
      data: { personId: null },
    });
    await tx.address.updateMany({
      where: { organizationId, createdByPersonId: target.id },
      data: { createdByPersonId: requesterPersonId },
    });
    await tx.address.updateMany({
      where: { organizationId, updatedByPersonId: target.id },
      data: { updatedByPersonId: null },
    });
    await tx.address.updateMany({
      where: { organizationId, invitedByPersonId: target.id },
      data: { invitedByPersonId: null },
    });
    await tx.address.updateMany({
      where: { organizationId, pendingDeletionByPersonId: target.id },
      data: { pendingDeletionByPersonId: null },
    });
    await tx.agendaEvent.updateMany({
      where: { organizationId, conductorPersonId: target.id },
      data: { conductorPersonId: null },
    });
    await tx.surveyPin.updateMany({
      where: { createdByPersonId: target.id },
      data: { createdByPersonId: null },
    });
    await tx.surveyPin.updateMany({
      where: { confirmedByPersonId: target.id },
      data: { confirmedByPersonId: null },
    });
    await tx.inviteToken.updateMany({
      where: { usedByPersonId: target.id },
      data: { usedByPersonId: null },
    });
    await tx.inviteToken.deleteMany({
      where: { OR: [{ personId: target.id }, { createdByPersonId: target.id }] },
    });
    await tx.person.delete({ where: { id: target.id } });
  });

  revalidatePath(`/org/${slug}/admin/pessoas`);
  return { success: true };
};
