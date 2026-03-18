import { Address, Card, CardEvent, User } from "@prisma/client";

export type CardWithRelations = Card & {
  address: Address[];
  assignedUser: User | null;
  createdBy: User;
  events: (CardEvent & { user: User })[];
};

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
