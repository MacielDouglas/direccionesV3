"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminOrOwner, requireOrgAdminOrOwner } from "@/server/users";
import { revalidatePath } from "next/cache";
import { createCardSchema, editCardSchema } from "../domain/card.schema";
import { getNextCardNumber } from "./card.service";

export async function createCardAction(
  organizationId: string,
  organizationSlug: string,
  rawData: unknown,
) {
  const parsed = createCardSchema.safeParse(rawData);
  if (!parsed.success) return { error: "Dados inválidos." };

  const { addressIds } = parsed.data;

  try {
    const data = await requireOrgAdminOrOwner(organizationId);

    const result = await prisma.$transaction(async (tx) => {
      const addresses = await tx.address.findMany({
        where: {
          id: { in: addressIds },
          organizationId,
          cardId: null,
          // active: true,
          pendingDeletion: false,
        },
        select: { id: true },
      });

      if (addresses.length !== addressIds.length) {
        throw new Error("Una o más direcciones no son válidas o ya están en uso.");
      }

      const number = await getNextCardNumber(organizationId);

      return tx.card.create({
        data: {
          number,
          organizationId,
          createdByPersonId: data.person.id,
          addresses: { connect: addressIds.map((id) => ({ id })) },
        },
      });
    });

    revalidatePath(`/org/${organizationSlug}/admin/cards`);
    return { success: true, cardId: result.id, cardNumber: result.number };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Error al crear la tarjeta.",
    };
  }
}

export async function assignCardAction(cardId: string, personId: string, organizationSlug: string) {
  try {
    const data = await requireAdminOrOwner();
    const organizationId = data.person?.organizationId;
    if (!organizationId) throw new Error("Sin organización activa.");

    await prisma.$transaction(async (tx) => {
      const card = await tx.card.findFirst({
        where: { id: cardId, organizationId },
      });
      if (!card) throw new Error("Tarjeta no encontrada.");
      if (card.assignedPersonId) throw new Error("La tarjeta ya ha sido asignada.");

      const assignee = await tx.person.findFirst({
        where: { organizationId, id: personId },
        select: { id: true },
      });
      if (!assignee) throw new Error("La persona no pertenece a la organización.");

      await tx.card.update({
        where: { id: cardId },
        data: {
          assignedPersonId: personId,
          startDate: new Date(),
          endDate: null,
        },
      });

      await tx.cardEvent.create({
        data: {
          id: crypto.randomUUID(),
          cardId,
          personId,
          actorPersonId: data.person.id,
          action: "ASSIGNED",
        },
      });
    });

    revalidatePath(`/org/${organizationSlug}/admin/cards`);
    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Error al asignar tarjeta.",
    };
  }
}

export async function returnCardAction(cardId: string, organizationSlug: string) {
  try {
    const data = await requireAdminOrOwner();
    const organizationId = data.person?.organizationId;
    if (!organizationId) throw new Error("Sin organización activa.");

    await prisma.$transaction(async (tx) => {
      const card = await tx.card.findFirst({
        where: { id: cardId, organizationId },
      });
      if (!card) throw new Error("Tarjeta no encontrada.");
      if (!card.assignedPersonId) throw new Error("La tarjeta no está asignada.");

      const assignedPersonId = card.assignedPersonId;

      await tx.card.update({
        where: { id: cardId },
        data: {
          assignedPersonId: null,
          endDate: new Date(),
        },
      });

      await tx.cardEvent.create({
        data: {
          id: crypto.randomUUID(),
          cardId,
          personId: assignedPersonId,
          actorPersonId: data.person.id,
          action: "RETURNED",
        },
      });
    });

    revalidatePath(`/org/${organizationSlug}/admin/cards`);
    revalidatePath(`/org/${organizationSlug}/my-cards`);
    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Error al devolver la tarjeta.",
    };
  }
}

export async function getCardRegistryAction(cardId: string) {
  try {
    const data = await requireAdminOrOwner();
    const organizationId = data.person?.organizationId;
    if (!organizationId) throw new Error("Sin organización activa.");

    const card = await prisma.card.findFirst({
      where: { id: cardId, organizationId },
      select: {
        id: true,
        number: true,
        assignedTo: {
          select: { id: true, name: true, user: { select: { image: true } } },
        },
      },
    });
    if (!card) throw new Error("Tarjeta no encontrada.");

    const events = await prisma.cardEvent.findMany({
      where: { cardId: card.id },
      orderBy: { date: "desc" },
      take: 50,
      select: {
        id: true,
        action: true,
        date: true,
        person: { select: { id: true, name: true, user: { select: { image: true } } } },
      },
    });

    return {
      success: true,
      cardNumber: card.number,
      current: card.assignedTo,
      events: events.map((event) => ({
        id: event.id,
        action: event.action,
        date: event.date.toISOString(),
        person: event.person,
      })),
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Error al cargar el registro.",
    };
  }
}

export async function deleteCardAction(cardId: string, organizationSlug: string) {
  try {
    const data = await requireAdminOrOwner();
    const organizationId = data.person?.organizationId;
    if (!organizationId) return { error: "Sin organización activa." };

    const card = await prisma.card.findFirst({
      where: { id: cardId, organizationId },
    });
    if (!card) return { error: "Tarjeta no encontrada." };

    await prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { cardId },
        data: { cardId: null },
      });
      await tx.cardEvent.deleteMany({ where: { cardId } });
      await tx.card.delete({ where: { id: cardId } });
    });

    revalidatePath(`/org/${organizationSlug}/admin/cards`);
    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Error al eliminar la tarjeta.",
    };
  }
}

export async function updateCardAction(
  cardId: string,
  organizationId: string,
  organizationSlug: string,
  rawData: unknown,
) {
  const parsed = editCardSchema.safeParse(rawData);
  if (!parsed.success) return { error: "Datos inválidos." };

  const { addressIds } = parsed.data;

  try {
    const data = await requireOrgAdminOrOwner(organizationId);

    await prisma.$transaction(async (tx) => {
      const card = await tx.card.findFirst({
        where: { id: cardId, organizationId },
        include: { addresses: { select: { id: true } } },
      });

      if (!card) throw new Error("Tarjeta no encontrada.");

      const currentIds = card.addresses.map((a) => a.id);
      const toConnect = addressIds.filter((id) => !currentIds.includes(id));
      const toDisconnect = currentIds.filter((id) => !addressIds.includes(id));

      // Valida que os novos addresses estão disponíveis
      if (toConnect.length > 0) {
        const available = await tx.address.findMany({
          where: {
            id: { in: toConnect },
            organizationId,
            cardId: null,
            active: true,
            pendingDeletion: false,
          },
          select: { id: true },
        });

        if (available.length !== toConnect.length) {
          throw new Error("Una o más direcciones no están disponibles.");
        }
      }

      await tx.card.update({
        where: { id: cardId },
        data: {
          updatedByPersonId: data.person.id,
          addresses: {
            connect: toConnect.map((id) => ({ id })),
            disconnect: toDisconnect.map((id) => ({ id })),
          },
        },
      });
    });

    revalidatePath(`/org/${organizationSlug}/admin/cards`);
    revalidatePath(`/org/${organizationSlug}/admin/cards/${cardId}/edit`);
    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Error al actualizar la tarjeta.",
    };
  }
}
