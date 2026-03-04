"use server";

import { getCurrentUser } from "@/server/users";
import {
  createAddressService,
  getAddressByIdService,
  updateAddressService,
} from "./address.service";
import type { AddressFormData } from "../domain/address.schema";

async function getSessionOrThrow() {
  const session = await getCurrentUser();

  if (!session) throw new Error("No autenticado.");
  if (!session.activeMember?.organizationId) {
    throw new Error("El usuario no pertenece a ninguna organización activa.");
  }

  return {
    organizationId: session.activeMember.organizationId,
    userId: session.user.id,
  };
}

export async function createAddressAction(input: AddressFormData) {
  const { organizationId, userId } = await getSessionOrThrow();
  return createAddressService({ input, organizationId, userId });
}

export async function updateAddressAction(
  addressId: string,
  input: AddressFormData,
) {
  const { organizationId, userId } = await getSessionOrThrow();
  return updateAddressService({ addressId, input, organizationId, userId });
}

export async function getAddressByIdAction(addressId: string) {
  const { organizationId } = await getSessionOrThrow();
  return getAddressByIdService({ addressId, organizationId });
}
