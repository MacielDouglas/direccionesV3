import { DEFAULT_ADDRESS_IMAGES } from "../domain/constants/address.constants";
import type { AddressType } from "../types/address.types";

export function getDefaultAddressImage(type?: AddressType): string | null {
  if (!type) return null;
  return DEFAULT_ADDRESS_IMAGES.find((img) => img.type === type)?.url ?? null;
}
