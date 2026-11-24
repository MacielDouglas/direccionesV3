import type { Address } from "@prisma/client";

export const ADDRESS_TYPES = ["House", "Apartment", "Store", "Hotel", "Restaurant"] as const;

export type AddressType = (typeof ADDRESS_TYPES)[number];

export type AddressWithUsers = Address & {
  createdUser: { name: string } | null;
  updatedUser: { name: string } | null;
};
