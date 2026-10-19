"use client";

import type { AddressWithUsers } from "@/features/addresses/types/address.types";
import { useNetworkStatus } from "@/features/pwa/core/network-status";
import { readCardsSnapshot } from "@/features/pwa/core/offline-store";
import { useOfflineSync } from "@/features/pwa/core/offline-sync";
import type { OfflineCardsSnapshot } from "@/features/pwa/types/offline.types";
import { OfflineSyncButton } from "@/features/pwa/ui/OfflineSyncButton";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { AddressInviteDto } from "@/server/address/address.action";
import { fetchAddressWithUsers } from "@/server/address/address.action";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AddressDetailModal } from "./AddressDetailModal";
import { MyCardsListView } from "./MyCardsListView";
import { MyCardsMapModal } from "./MyCardsMapModal";

type CardAddress = {
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

type Card = {
  id: string;
  number: number;
  startDate: Date | null;
  addresses: CardAddress[];
};

type MapAddress = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
};

type MapSelection = {
  title: string;
  subtitle: string;
  addresses: MapAddress[];
};

type AddressDetailState = {
  id: string;
  promise: Promise<AddressWithUsers | null>;
  readOnly: boolean;
  invites?: AddressInviteDto[];
};

interface Props {
  cards: Card[];
  organizationId: string;
  organizationSlug: string;
  personId: string;
  totalAddresses: number;
}

export function MyCardsClient({
  cards,
  organizationId,
  organizationSlug,
  personId,
  totalAddresses,
}: Props) {
  const { t } = useI18n();
  const { online } = useNetworkStatus();
  const { lastSyncedAt } = useOfflineSync();
  const [cached, setCached] = useState<OfflineCardsSnapshot | null>(null);
  const [detail, setDetail] = useState<AddressDetailState | null>(null);
  const [mapSelection, setMapSelection] = useState<MapSelection | null>(null);

  useEffect(() => {
    let cancelled = false;
    const requestedAt = lastSyncedAt;

    void readCardsSnapshot(organizationId, personId).then((snapshot) => {
      if (cancelled) return;
      if (requestedAt && snapshot?.updatedAt && snapshot.updatedAt < requestedAt) return;
      setCached(snapshot);
    });

    return () => {
      cancelled = true;
    };
  }, [organizationId, personId, lastSyncedAt]);

  const effectiveCards: Card[] = !online && cached ? cached.cards : cards;

  const { allAddresses } = useMemo(() => {
    const addresses = effectiveCards
      .flatMap((card) => card.addresses)
      .filter(
        (a): a is typeof a & { latitude: number; longitude: number } =>
          a.latitude != null && a.longitude != null,
      )
      .map((a) => ({
        id: a.id,
        label: a.businessName ?? `${a.street}, ${a.number}`,
        latitude: a.latitude,
        longitude: a.longitude,
      }));

    return {
      allAddresses: addresses,
    };
  }, [effectiveCards]);

  const openAddress = (id: string) => {
    const cachedAddress = cached?.addresses[id];

    if (!online) {
      if (!cachedAddress) {
        toast.error(t.pwa.offlineNoData);
        return;
      }
      setDetail({
        id,
        promise: Promise.resolve(cachedAddress),
        readOnly: true,
        invites: cachedAddress.invites,
      });
      return;
    }

    const promise = (async () => {
      try {
        return await fetchAddressWithUsers(id);
      } catch {
        setDetail((current) =>
          current?.id === id
            ? {
                ...current,
                readOnly: true,
                invites: cachedAddress?.invites ?? [],
              }
            : current,
        );
        return cachedAddress ?? null;
      }
    })();

    setDetail({ id, promise, readOnly: false, invites: undefined });
  };

  const openAllAddressesMap = () => {
    if (!online || allAddresses.length === 0) return;
    setMapSelection({
      title: t.cards.mine,
      subtitle: t.cards.addressesCount.replace("{count}", String(allAddresses.length)),
      addresses: allAddresses,
    });
  };

  const openCardMap = (cardId: string) => {
    if (!online) return;
    const card = effectiveCards.find((c) => c.id === cardId);
    if (!card) return;
    const addresses = card.addresses
      .filter(
        (a): a is typeof a & { latitude: number; longitude: number } =>
          a.latitude != null && a.longitude != null,
      )
      .map((a) => ({
        id: a.id,
        label: a.businessName ?? `${a.street}, ${a.number}`,
        latitude: a.latitude,
        longitude: a.longitude,
      }));
    if (addresses.length === 0) return;
    const cardNumber = String(card.number).padStart(2, "0");
    setMapSelection({
      title: t.cards.cardNumber.replace("{number}", cardNumber),
      subtitle: t.cards.addressesCount.replace("{count}", String(addresses.length)),
      addresses,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {!online && (
          <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
            {t.pwa.offlineReadOnly}
          </span>
        )}
        <OfflineSyncButton />
      </div>

      <MyCardsListView
        cards={effectiveCards}
        organizationSlug={organizationSlug}
        totalAddresses={totalAddresses}
        online={online}
        onOpenAddress={openAddress}
        onOpenCardMap={openCardMap}
        onOpenAllMap={openAllAddressesMap}
        allAddressesCount={allAddresses.length}
      />

      <div className="flex flex-col items-stretch gap-4 sm:items-center">
        {detail && (
          <AddressDetailModal
            promise={detail.promise}
            organizationSlug={organizationSlug}
            onClose={() => setDetail(null)}
            myCards
            readOnly={detail.readOnly}
            initialInvites={detail.invites}
          />
        )}
      </div>

      {online && mapSelection && (
        <MyCardsMapModal
          open
          onClose={() => setMapSelection(null)}
          addresses={mapSelection.addresses}
          onMarkerClick={openAddress}
          title={mapSelection.title}
          subtitle={mapSelection.subtitle}
        />
      )}
    </div>
  );
}
