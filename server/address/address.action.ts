"use server";

import type { AddressWithUsers } from "@/features/addresses/types/address.types";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAuthContext } from "@/server/users";
import { z } from "zod";

const personSelect = {
  id: true,
  name: true,
  user: { select: { image: true } },
} as const;

export async function fetchAddressWithUsers(id: string): Promise<AddressWithUsers | null> {
  const data = await getCurrentUser();
  if (!data?.person) return null;

  const address = await prisma.address.findUnique({ where: { id } });
  if (!address) return null;
  if (address.organizationId !== data.person.organizationId) return null;

  const [createdPerson, updatedPerson] = await Promise.all([
    prisma.person.findUnique({
      where: { id: address.createdByPersonId },
      select: personSelect,
    }),
    address.updatedByPersonId
      ? prisma.person.findUnique({
          where: { id: address.updatedByPersonId },
          select: personSelect,
        })
      : null,
  ]);

  return { ...address, createdUser: createdPerson, updatedUser: updatedPerson };
}

const inviteTypeSchema = z.enum(["CELEBRATION", "CONVENTION", "OTHER"]);
const otherLabelSchema = z.string().trim().min(1).max(120).nullable().optional();

// ✅ Exige que o endereço pertença a um card designado ao usuário logado
async function requireMyAddressAccess(addressId: string) {
  const current = await requireAuthContext();
  if (current.isSuperUser) throw new Error("Sin permiso.");

  const address = await prisma.address.findFirst({
    where: { id: addressId, card: { assignedPersonId: current.person.id } },
    select: { id: true },
  });
  if (!address) throw new Error("Sin permiso.");

  return current;
}

export type AddressInviteDto = {
  id: string;
  year: number;
  type: "CELEBRATION" | "CONVENTION" | "OTHER";
  otherLabel: string | null;
  createdAt: string;
  deliveredBy: { name: string } | null;
};

export async function getAddressInvitesAction(addressId: string): Promise<AddressInviteDto[]> {
  await requireMyAddressAccess(addressId);
  const year = new Date().getFullYear();

  const invites = await prisma.addressInvite.findMany({
    where: { addressId, year: { gte: year - 2 } },
    orderBy: { createdAt: "desc" },
    include: { deliveredBy: { select: { name: true } } },
  });

  return invites.map((invite) => ({
    id: invite.id,
    year: invite.year,
    type: invite.type,
    otherLabel: invite.otherLabel,
    createdAt: invite.createdAt.toISOString(),
    deliveredBy: invite.deliveredBy,
  }));
}

export async function setAddressFlagAction(
  addressId: string,
  flag: "personChanged" | "noVisits",
  value: boolean,
) {
  const flagSchema = z.enum(["personChanged", "noVisits"]);
  const valueSchema = z.boolean();
  const parsed = flagSchema.safeParse(flag);
  if (!parsed.success) throw new Error("Datos inválidos.");
  const parsedValue = valueSchema.safeParse(value);
  if (!parsedValue.success) throw new Error("Datos inválidos.");

  await requireMyAddressAccess(addressId);

  await prisma.address.update({
    where: { id: addressId },
    data: parsed.data === "personChanged" ? { personChanged: value } : { noVisits: value },
  });

  return { success: true };
}

export async function createAddressInviteAction(
  addressId: string,
  type: string,
  otherLabel?: string | null,
) {
  const parsedType = inviteTypeSchema.safeParse(type);
  if (!parsedType.success) throw new Error("Datos inválidos.");
  const parsedOther = otherLabelSchema.safeParse(otherLabel);
  if (!parsedOther.success) throw new Error("Datos inválidos.");
  if (parsedType.data === "OTHER" && !parsedOther.data) {
    throw new Error("El tipo de invitación es obligatorio.");
  }

  const current = await requireMyAddressAccess(addressId);
  const year = new Date().getFullYear();

  const invite = await prisma.$transaction(async (tx) => {
    await tx.addressInvite.deleteMany({
      where: { addressId, year: { lt: year - 2 } },
    });
    return tx.addressInvite.create({
      data: {
        addressId,
        year,
        type: parsedType.data,
        otherLabel: parsedOther.data ?? null,
        deliveredByPersonId: current.person.id,
      },
      include: { deliveredBy: { select: { name: true } } },
    });
  });

  return {
    success: true,
    invite: {
      id: invite.id,
      year: invite.year,
      type: invite.type,
      otherLabel: invite.otherLabel,
      createdAt: invite.createdAt.toISOString(),
      deliveredBy: invite.deliveredBy,
    } satisfies AddressInviteDto,
  };
}
