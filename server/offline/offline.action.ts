"use server";

import {
  listMyCards,
  listMyCardsOfflineAddresses,
} from "@/features/cards/application/card.service";
import { getCurrentWeekProgram } from "@/features/meetings/application/meeting.service";
import type {
  OfflineAddressDetail,
  OfflineMeetingsSnapshot,
  OfflineSnapshot,
} from "@/features/pwa/types/offline.types";
import { requireOrgMember } from "@/server/users";
import { z } from "zod";

const inputSchema = z.object({
  organizationId: z.string().min(1),
});

export async function getOfflineSnapshotAction(input: {
  organizationId: string;
}): Promise<OfflineSnapshot | null> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return null;

  const { organizationId } = parsed.data;
  const auth = await requireOrgMember(organizationId);
  if (!auth.person) return null;

  const personId = auth.person.id;

  const [cards, addressRows] = await Promise.all([
    listMyCards(organizationId, personId),
    listMyCardsOfflineAddresses(organizationId, personId),
  ]);

  const addresses: Record<string, OfflineAddressDetail> = {};

  for (const row of addressRows) {
    const { createdBy, updatedBy, invites, image, ...address } = row;

    addresses[row.id] = {
      ...address,
      image: null,
      createdUser: createdBy,
      updatedUser: updatedBy,
      invites: invites.map((invite) => ({
        id: invite.id,
        year: invite.year,
        type: invite.type,
        otherLabel: invite.otherLabel,
        createdAt: invite.createdAt.toISOString(),
        deliveredBy: invite.deliveredBy,
      })),
    };
  }

  let meetings: OfflineMeetingsSnapshot | null = null;

  try {
    const state = await getCurrentWeekProgram(organizationId);
    if (state.connected && "week" in state) {
      meetings = {
        kind: "meetings",
        organizationId,
        updatedAt: new Date().toISOString(),
        week: state.week,
      };
    }
  } catch {
    meetings = null;
  }

  const syncedAt = new Date().toISOString();

  return {
    organizationId,
    personId,
    syncedAt,
    cards: {
      kind: "cards",
      organizationId,
      personId,
      updatedAt: syncedAt,
      cards,
      addresses,
    },
    meetings,
  };
}
