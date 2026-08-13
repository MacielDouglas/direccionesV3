"use server";

import type { AddressWithUsers } from "@/features/addresses/types/address.types";
import { prisma } from "@/lib/prisma";
import { getUniquePerson } from "@/server/users";

export async function fetchAddressWithUsers(id: string): Promise<AddressWithUsers | null> {
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address) return null;

  const [createdPerson, updatedPerson] = await Promise.all([
    getUniquePerson(address.createdByPersonId),
    address.updatedByPersonId ? getUniquePerson(address.updatedByPersonId) : null,
  ]);

  return { ...address, createdUser: createdPerson, updatedUser: updatedPerson };
}
