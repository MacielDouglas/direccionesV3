"use server";

import type { Role } from "@/domains/member/types/role.types";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/users";
import { revalidatePath } from "next/cache";

const canManageRequester = (role: string | undefined | null) =>
  role === "owner" || role === "admin";

const INVITE_TOKEN_VALIDITY_MS = 1000 * 60 * 60 * 24 * 3; // 72 horas

// Token numérico de 6 dígitos, sem colisão com tokens existentes.
async function generateNumericInviteToken(): Promise<string> {
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

  revalidatePath(`/org/${slug}/admin/gestao`);
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

  if (slug) revalidatePath(`/org/${slug}/admin/gestao`);
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

  revalidatePath(`/org/${slug}/admin/gestao`);
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

  const existing = await prisma.person.findFirst({
    where: { organizationId, name: parsedName },
    select: { id: true },
  });
  if (existing) throw new Error("Ya existe una persona con este nombre en la organización.");

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
        token: await generateNumericInviteToken(),
        expiresAt: new Date(Date.now() + INVITE_TOKEN_VALIDITY_MS),
      },
    });

    return newPerson;
  });

  revalidatePath(`/org/${slug}/admin/gestao`);
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
        token: await generateNumericInviteToken(),
        expiresAt: new Date(Date.now() + INVITE_TOKEN_VALIDITY_MS),
      },
    });
  });

  revalidatePath(`/org/${slug}/admin/gestao`);
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
      _count: { select: { cardsOwned: true, cardsAssigned: true } },
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
      cardsCount: person._count.cardsOwned + person._count.cardsAssigned,
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

  revalidatePath(`/org/${slug}/admin/gestao`);
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
  if (target.userId === currentUser.user.id) {
    throw new Error("No puedes eliminarte a ti mismo.");
  }
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

  revalidatePath(`/org/${slug}/admin/gestao`);
  return { success: true };
};

// ✅ Listar usuários da organização com info de pessoa vinculada (para página Usuários)
export const getOrgUsersWithPersons = async (organizationId: string) => {
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

  const persons = await prisma.person.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      role: true,
      userId: true,
      user: { select: { id: true, name: true, email: true, image: true, createdAt: true } },
    },
    orderBy: { name: "asc" },
  });

  const usersWithPerson = persons
    .filter((p) => p.userId)
    .map((p) => ({
      id: p.user?.id,
      name: p.user?.name,
      email: p.user?.email,
      image: p.user?.image,
      createdAt: p.user?.createdAt.toISOString(),
      person: { id: p.id, name: p.name, role: p.role },
    }));

  const usersWithoutPerson = persons
    .filter((p) => !p.userId)
    .map((p) => ({
      id: p.id,
      name: p.name,
      email: "",
      image: null,
      createdAt: new Date().toISOString(),
      person: { id: p.id, name: p.name, role: p.role },
    }));

  return { usersWithPerson, usersWithoutPerson };
};

// ✅ Atualizar nome de uma pessoa
export const updatePersonName = async (
  organizationId: string,
  personId: string,
  name: string,
  slug: string,
) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("No autenticado.");

  if (!currentUser.isSuperUser) {
    if (currentUser.person?.organizationId !== organizationId) {
      throw new Error("Sin permiso.");
    }
    // Qualquer pessoa pode renomear a si mesma; admin/owner renomeia os demais.
    if (currentUser.person?.id !== personId && !canManageRequester(currentUser.person?.role)) {
      throw new Error("Sin permiso.");
    }
  }

  const parsedName = name.trim();
  if (parsedName.length < 2) {
    throw new Error("El nombre debe tener al menos 2 caracteres.");
  }

  const existing = await prisma.person.findFirst({
    where: { organizationId, name: parsedName, id: { not: personId } },
    select: { id: true },
  });
  if (existing) throw new Error("Ya existe una persona con este nombre en la organización.");

  await prisma.person.update({
    where: { id: personId, organizationId },
    data: { name: parsedName },
  });

  revalidatePath(`/org/${slug}/admin/gestao`);
  return { success: true };
};

// ✅ Administrar cards de uma pessoa em bulk (owner + assigned)
export const adminBulkUpdatePersonCards = async (
  organizationId: string,
  personId: string,
  ownerCardIds: string[],
  assignedCardId: string | null,
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
    select: { id: true },
  });
  if (!person) throw new Error("Persona no encontrada.");

  const allCardIds = [...ownerCardIds, ...(assignedCardId ? [assignedCardId] : [])];
  const cards = await prisma.card.findMany({
    where: { id: { in: allCardIds }, organizationId },
    select: { id: true },
  });
  if (cards.length !== allCardIds.length) {
    throw new Error("Alguns cards não pertencem a esta organização.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.card.updateMany({
      where: { organizationId, ownerPersonId: personId },
      data: { ownerPersonId: null },
    });
    await tx.card.updateMany({
      where: { id: { in: ownerCardIds } },
      data: { ownerPersonId: personId },
    });
    await tx.card.updateMany({
      where: { organizationId, assignedPersonId: personId },
      data: { assignedPersonId: null },
    });
    if (assignedCardId) {
      await tx.card.update({
        where: { id: assignedCardId },
        data: { assignedPersonId: personId },
      });
    }
  });

  revalidatePath(`/org/${slug}/admin/gestao`);
  return { success: true };
};

// ✅ Dados para o modal "Administrar Cards" (da pessoa + disponíveis + designados)
export const getPersonCardsManageData = async (organizationId: string, personId: string) => {
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
    select: { id: true, name: true, role: true },
  });
  if (!person) throw new Error("Persona no encontrada.");

  const [personCards, available, designated] = await Promise.all([
    prisma.card.findMany({
      where: { organizationId, assignedPersonId: person.id },
      orderBy: { number: "asc" },
      select: {
        id: true,
        number: true,
        startDate: true,
        createdAt: true,
        addresses: { select: { id: true, neighborhood: true } },
      },
    }),
    prisma.card.findMany({
      where: { organizationId, assignedPersonId: null },
      orderBy: { number: "asc" },
      select: {
        id: true,
        number: true,
        addresses: { select: { id: true, neighborhood: true } },
      },
    }),
    prisma.card.findMany({
      where: { organizationId, assignedPersonId: { not: null } },
      orderBy: { number: "asc" },
      select: {
        id: true,
        number: true,
        startDate: true,
        createdAt: true,
        assignedTo: { select: { name: true } },
        addresses: { select: { id: true, neighborhood: true } },
      },
    }),
  ]);

  const lastReturnEvents = await prisma.cardEvent.findMany({
    where: {
      action: "RETURNED",
      cardId: { in: available.map((card) => card.id) },
    },
    orderBy: { date: "desc" },
    select: { cardId: true, date: true },
  });
  const lastReturnByCard = new Map<string, string>();
  for (const event of lastReturnEvents) {
    if (!lastReturnByCard.has(event.cardId)) {
      lastReturnByCard.set(event.cardId, event.date.toISOString());
    }
  }

  const mapCard = (card: {
    id: string;
    number: number;
    addresses: { id: string; neighborhood: string }[];
  }) => ({
    id: card.id,
    number: card.number,
    neighborhoods: [
      ...new Set(card.addresses.map((a) => a.neighborhood.trim()).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b)),
    addressCount: card.addresses.length,
  });

  return {
    person: { id: person.id, name: person.name, role: person.role },
    personCards: personCards.map((card) => ({
      ...mapCard(card),
      designationDate: (card.startDate ?? card.createdAt).toISOString(),
    })),
    availableCards: available.map((card) => ({
      ...mapCard(card),
      lastReturnDate: lastReturnByCard.get(card.id) ?? null,
    })),
    designatedCards: designated.map((card) => ({
      ...mapCard(card),
      personName: card.assignedTo?.name ?? "—",
      designationDate: (card.startDate ?? card.createdAt).toISOString(),
    })),
  };
};

// ✅ Devolver cards designados a uma pessoa (voltam para disponíveis)
export const adminReturnCardsAction = async (
  organizationId: string,
  personId: string,
  cardIds: string[],
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

  if (cardIds.length === 0) throw new Error("Selecciona al menos un card.");

  const person = await prisma.person.findFirst({
    where: { id: personId, organizationId },
    select: { id: true },
  });
  if (!person) throw new Error("Persona no encontrada.");

  const cards = await prisma.card.findMany({
    where: { id: { in: cardIds }, organizationId, assignedPersonId: person.id },
    select: { id: true },
  });
  if (cards.length !== cardIds.length) {
    throw new Error(
      "Alguns cards não estão designados a esta persona ou não pertencem à organização.",
    );
  }

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    for (const card of cards) {
      await tx.card.update({
        where: { id: card.id },
        data: { assignedPersonId: null, startDate: null, endDate: now },
      });
      await tx.cardEvent.create({
        data: {
          id: crypto.randomUUID(),
          action: "RETURNED",
          personId: person.id,
          actorPersonId: currentUser.person.id,
          cardId: card.id,
          date: now,
        },
      });
    }
  });

  revalidatePath(`/org/${slug}/admin/gestao`);
  return { success: true };
};

// ✅ Transferir um card designado de outra pessoa para a pessoa administrada
export const adminTransferCardAction = async (
  organizationId: string,
  personId: string,
  cardId: string,
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
    select: { id: true },
  });
  if (!person) throw new Error("Persona no encontrada.");

  const card = await prisma.card.findFirst({
    where: { id: cardId, organizationId, assignedPersonId: { not: null } },
    select: { id: true, assignedPersonId: true },
  });
  if (!card) throw new Error("Card no encontrado.");
  if (card.assignedPersonId === person.id) {
    throw new Error("Este card ya está designado a esta persona.");
  }

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.card.update({
      where: { id: card.id },
      data: { assignedPersonId: person.id, startDate: now, endDate: null },
    });
    // Devolução do card para a pessoa que o tinha e nova designação para o destino.
    await tx.cardEvent.create({
      data: {
        id: crypto.randomUUID(),
        action: "RETURNED",
        personId: card.assignedPersonId,
        actorPersonId: currentUser.person.id,
        cardId: card.id,
        date: now,
      },
    });
    await tx.cardEvent.create({
      data: {
        id: crypto.randomUUID(),
        action: "ASSIGNED",
        personId: person.id,
        actorPersonId: currentUser.person.id,
        cardId: card.id,
        date: now,
      },
    });
  });

  revalidatePath(`/org/${slug}/admin/gestao`);
  return { success: true };
};

// ✅ Designar cards disponíveis a uma pessoa
export const adminDesignateCardsAction = async (
  organizationId: string,
  personId: string,
  cardIds: string[],
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

  if (cardIds.length === 0) throw new Error("Selecciona al menos un card.");

  const person = await prisma.person.findFirst({
    where: { id: personId, organizationId },
    select: { id: true },
  });
  if (!person) throw new Error("Persona no encontrada.");

  const cards = await prisma.card.findMany({
    where: { id: { in: cardIds }, organizationId, assignedPersonId: null },
    select: { id: true },
  });
  if (cards.length !== cardIds.length) {
    throw new Error("Alguns cards já estão designados ou não pertencem a esta organização.");
  }

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    for (const card of cards) {
      await tx.card.update({
        where: { id: card.id },
        data: { assignedPersonId: person.id, startDate: now, endDate: null },
      });
      await tx.cardEvent.create({
        data: {
          id: crypto.randomUUID(),
          action: "ASSIGNED",
          personId: person.id,
          actorPersonId: currentUser.person.id,
          cardId: card.id,
          date: now,
        },
      });
    }
  });

  revalidatePath(`/org/${slug}/admin/gestao`);
  return { success: true };
};

// ✅ Obter pessoa com seus cards (owner + assigned)
export const getPersonWithCards = async (organizationId: string, personId: string) => {
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
    select: {
      id: true,
      name: true,
      role: true,
      userId: true,
      cardsOwned: { select: { id: true, number: true, assignedPersonId: true } },
      cardsAssigned: { select: { id: true, number: true, assignedPersonId: true } },
    },
  });
  if (!person) return null;

  const [allCards, neighborhoods] = await Promise.all([
    prisma.card.findMany({
      where: { organizationId },
      orderBy: { number: "asc" },
      select: {
        id: true,
        number: true,
        ownerPersonId: true,
        assignedPersonId: true,
        owner: { select: { name: true } },
        assignedTo: { select: { name: true } },
        addresses: { select: { neighborhood: true } },
      },
    }),
    prisma.address.groupBy({
      by: ["neighborhood"],
      where: { organizationId },
      _count: { _all: true },
      orderBy: { neighborhood: "asc" },
    }),
  ]);

  return {
    ...person,
    allCards: allCards.map((card) => ({
      id: card.id,
      number: card.number,
      ownerPersonId: card.ownerPersonId,
      assignedPersonId: card.assignedPersonId,
      ownerName: card.owner?.name ?? null,
      assignedToName: card.assignedTo?.name ?? null,
      neighborhoods: [
        ...new Set(card.addresses.map((address) => address.neighborhood.trim()).filter(Boolean)),
      ].sort((a, b) => a.localeCompare(b)),
    })),
    neighborhoods: neighborhoods.map((neighborhood) => ({
      name: neighborhood.neighborhood,
      count: neighborhood._count._all,
    })),
  };
};
