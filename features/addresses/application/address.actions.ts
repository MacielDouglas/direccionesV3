"use server";

import { getCurrentUser } from "@/server/users";
import {
  createAddressService,
  getAddressByIdService,
  updateAddressService,
} from "./address.service";
import { AddressFormData } from "../domain/address.schema";
// import { uploadAddressImage } from "./address-image.service";

export async function createAddressAction(input: AddressFormData) {
  const session = await getCurrentUser();

  return createAddressService({
    input,
    organizationId: session!.activeMember!.organizationId,
    userId: session!.user.id,
  });
}

export async function updateAddressAction(
  addressId: string,
  input: AddressFormData,
) {
  const session = await getCurrentUser();

  return updateAddressService({
    addressId,
    input,
    organizationId: session!.activeMember!.organizationId,
    userId: session!.user.id,
  });
}

export async function getAddressByIdAction(addressId: string) {
  const session = await getCurrentUser();

  return getAddressByIdService({
    addressId,
    organizationId: session!.activeMember!.organizationId,
  });
}
