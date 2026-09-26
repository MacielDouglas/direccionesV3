"use client";

import type { AddressWithUsers } from "@/features/addresses/types/address.types";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { fetchAddressWithUsers } from "@/server/address/address.action";
import { Map as MapIcon } from "lucide-react";
import { useMemo, useState } from "react";
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

interface Props {
  cards: Card[];
  organizationSlug: string;
  totalAddresses: number;
}

export function MyCardsClient({ cards, organizationSlug, totalAddresses }: Props) {
  const { t } = useI18n();
  const [addressPromise, setAddressPromise] = useState<Promise<AddressWithUsers | null> | null>(
    null,
  );
  const [mapSelection, setMapSelection] = useState<MapSelection | null>(null);

  const { allAddresses } = useMemo(() => {
    const addresses = cards
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
  }, [cards]);

  const openAddress = (id: string) => {
    setAddressPromise(fetchAddressWithUsers(id));
  };

  const openAllAddressesMap = () => {
    if (allAddresses.length === 0) return;
    setMapSelection({
      title: t.cards.mine,
      subtitle: t.cards.addressesCount.replace("{count}", String(allAddresses.length)),
      addresses: allAddresses,
    });
  };

  const openCardMap = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
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
      <MyCardsListView
        cards={cards}
        organizationSlug={organizationSlug}
        totalAddresses={totalAddresses}
        onOpenAddress={openAddress}
        onOpenCardMap={openCardMap}
      />

      <div className="flex flex-col items-stretch gap-4 sm:items-center">
        {allAddresses.length > 0 && (
          <button
            type="button"
            onClick={() => openAllAddressesMap()}
            aria-label={`${t.cards.seeMap} — ${t.cards.addressesCount.replace("{count}", String(allAddresses.length))}`}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground shadow-xs transition-colors hover:bg-brand/90 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:w-auto sm:min-w-72"
          >
            <MapIcon className="size-4 shrink-0" aria-hidden />
            {t.cards.seeMap}
            <span
              aria-hidden
              className="rounded-full bg-black/15 px-2 py-0.5 text-xs font-bold tabular-nums"
            >
              {allAddresses.length}
            </span>
          </button>
        )}

        {addressPromise && (
          <AddressDetailModal
            promise={addressPromise}
            organizationSlug={organizationSlug}
            onClose={() => setAddressPromise(null)}
            myCards
          />
        )}
      </div>

      {mapSelection && (
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
