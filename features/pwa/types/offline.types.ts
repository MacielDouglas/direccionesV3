import type { AddressWithUsers } from "@/features/addresses/types/address.types";
import type { StoredWeekProgram } from "@/features/meetings/application/meeting.service";
import type { AddressInviteDto } from "@/server/address/address.action";

export type OfflineCardAddress = {
  id: string;
  type: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  businessName: string | null;
  pendingDeletionAt: Date | null;
  latitude: number | null;
  longitude: number | null;
  active: boolean;
};

export type OfflineCard = {
  id: string;
  number: number;
  startDate: Date | null;
  addresses: OfflineCardAddress[];
};

export type OfflineAddressDetail = AddressWithUsers & {
  invites: AddressInviteDto[];
};

export type OfflineCardsSnapshot = {
  kind: "cards";
  organizationId: string;
  personId: string;
  updatedAt: string;
  cards: OfflineCard[];
  addresses: Record<string, OfflineAddressDetail>;
};

export type OfflineMeetingsSnapshot = {
  kind: "meetings";
  organizationId: string;
  updatedAt: string;
  week: StoredWeekProgram;
};

export type OfflineSnapshot = {
  organizationId: string;
  personId: string;
  syncedAt: string;
  cards: OfflineCardsSnapshot | null;
  meetings: OfflineMeetingsSnapshot | null;
};
