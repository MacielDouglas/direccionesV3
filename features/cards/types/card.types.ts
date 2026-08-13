import type { Address, Card, CardEvent } from "@prisma/client";

export type CardWithRelations = Card & {
  address: Address[];
  assignedTo: {
    id: string;
    name: string;
    user: { email: string; image: string | null } | null;
  } | null;
  createdBy: { id: string; name: string };
  events: (CardEvent & {
    person: { id: string; name: string; user: { image: string | null } | null } | null;
  })[];
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

export type OrgPerson = {
  id: string;
  name: string;
  role: string | null;
  organizationId: string | null;
  user: { id: string; name: string; email: string; image: string | null } | null;
};
