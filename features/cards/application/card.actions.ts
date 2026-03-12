"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getNextCardNumber } from "./card.service";
import { createCardSchema, editCardSchema } from "../domain/card.schema";
import { getCurrentUser, requireSession } from "@/server/users";

export async function createCardAction(
  organizationId: string,
  organizationSlug: string,
  rawData: unknown,
) {
  const session = await requireSession();
  const parsed = createCardSchema.safeParse(rawData);
  if (!parsed.success) return { error: "Dados inválidos." };

  const { addressIds } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const addresses = await tx.address.findMany({
        where: {
          id: { in: addressIds },
          organizationId,
          cardId: null,
          active: true,
          pendingDeletion: false,
        },
        select: { id: true },
      });

      if (addresses.length !== addressIds.length) {
        throw new Error(
          "Una o más direcciones no son válidas o ya están en uso.",
        );
      }

      const number = await getNextCardNumber(organizationId);

      return tx.card.create({
        data: {
          number,
          organizationId,
          createdById: session.user.id,
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

export async function assignCardAction(
  cardId: string,
  userId: string,
  organizationSlug: string,
) {
  const session = await requireSession();

  try {
    await prisma.$transaction(async (tx) => {
      const card = await tx.card.findUnique({ where: { id: cardId } });
      if (!card) throw new Error("Tarjeta no encontrada.");
      if (card.assignedUserId)
        throw new Error("La tarjeta ya ha sido asignada.");

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
          userId: session.user.id,
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

export async function returnCardAction(
  cardId: string,
  organizationSlug: string,
) {
  const session = await requireSession();

  try {
    await prisma.$transaction(async (tx) => {
      const card = await tx.card.findUnique({ where: { id: cardId } });
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
          userId: session.user.id,
          action: "RETURNED",
        },
      });
    });

    revalidatePath(`/org/${organizationSlug}/admin/cards`);
    revalidatePath(`/org/${organizationSlug}/my-cards`);
    return { success: true };
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "Error al devolver la tarjeta.",
    };
  }
}

export async function deleteCardAction(
  cardId: string,
  organizationSlug: string,
) {
  const data = await getCurrentUser(); // já cacheado
  if (!data) return { error: "No autenticado." };

  const organizationId = data.activeMember?.organizationId;
  if (!organizationId) return { error: "Sin organización activa." };

  const card = await prisma.card.findFirst({
    where: { id: cardId, organizationId },
  });
  if (!card) return { error: "Tarjeta no encontrada." };

  try {
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
      error:
        err instanceof Error ? err.message : "Error al eliminar la tarjeta.",
    };
  }
}

export async function updateCardAction(
  cardId: string,
  organizationId: string,
  organizationSlug: string,
  rawData: unknown,
) {
  const session = await requireSession();

  const parsed = editCardSchema.safeParse(rawData);
  if (!parsed.success) return { error: "Datos inválidos." };

  const { addressIds } = parsed.data;

  try {
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
          updatedById: session.user.id,
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
      error:
        err instanceof Error ? err.message : "Error al actualizar la tarjeta.",
    };
  }
}
