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
          createdById: data.user.id,
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

export async function assignCardAction(cardId: string, userId: string, organizationSlug: string) {
  try {
    const data = await requireAdminOrOwner();
    const organizationId = data.activeMember?.organizationId;
    if (!organizationId) throw new Error("Sin organización activa.");

    await prisma.$transaction(async (tx) => {
      const card = await tx.card.findFirst({
        where: { id: cardId, organizationId },
      });
      if (!card) throw new Error("Tarjeta no encontrada.");
      if (card.assignedUserId) throw new Error("La tarjeta ya ha sido asignada.");

      const assignee = await tx.member.findFirst({
        where: { organizationId, userId },
        select: { id: true },
      });
      if (!assignee) throw new Error("El usuario no pertenece a la organización.");

      await tx.card.update({
        where: { id: cardId },
        data: {
          assignedUserId: userId,
          startDate: new Date(),
          endDate: null,
        },
      });

      await tx.cardEvent.create({
        data: {
          id: crypto.randomUUID(),
          cardId,
          userId: data.user.id,
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
    const organizationId = data.activeMember?.organizationId;
    if (!organizationId) throw new Error("Sin organización activa.");

    await prisma.$transaction(async (tx) => {
      const card = await tx.card.findFirst({
        where: { id: cardId, organizationId },
      });
      if (!card) throw new Error("Tarjeta no encontrada.");
      if (!card.assignedUserId) throw new Error("La tarjeta no está asignada.");

      await tx.card.update({
        where: { id: cardId },
        data: {
          assignedUserId: null,
          endDate: new Date(),
        },
      });

      await tx.cardEvent.create({
        data: {
          id: crypto.randomUUID(),
          cardId,
          userId: data.user.id,
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

export async function deleteCardAction(cardId: string, organizationSlug: string) {
  try {
    const data = await requireAdminOrOwner();
    const organizationId = data.activeMember?.organizationId;
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
          updatedById: data.user.id,
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
