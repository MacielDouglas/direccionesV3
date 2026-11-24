import type { Address } from "@prisma/client";

export type AvailableAddress = Pick<
  Address,
  | "id"
  | "type"
  | "street"
  | "number"
  | "neighborhood"
  | "city"
  | "businessName"
  | "image"
  | "latitude"
  | "longitude"
  | "active"
>;
