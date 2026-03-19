"use server";

import { prisma } from "@/lib/prisma";
import { getUniqueUser } from "@/server/users";
import type { AddressWithUsers } from "@/features/addresses/types/address.types";

export async function fetchAddressWithUsers(
  id: string,
): Promise<AddressWithUsers | null> {
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address) return null;

  const [createdUser, updatedUser] = await Promise.all([
    getUniqueUser(address.createdUserId),
    address.updatedUserId ? getUniqueUser(address.updatedUserId) : null,
  ]);

  return { ...address, createdUser, updatedUser };
}
