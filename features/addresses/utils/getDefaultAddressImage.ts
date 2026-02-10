import { DEFAULT_ADDRESS_IMAGES } from "../constants/address.constants";
import { AddressType } from "../types/address.types";

export function getDefaultAddressImage(type?: AddressType) {
  if (!type) return null;

  return DEFAULT_ADDRESS_IMAGES.find((img) => img.type === type)?.url ?? null;
}
