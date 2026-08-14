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
  const [mapOpen, setMapOpen] = useState(false);

  const { allAddresses, addressIndexMap } = useMemo(() => {
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
      addressIndexMap: new Map(addresses.map((a, i) => [a.id, i + 1])),
    };
  }, [cards]);

  const openAddress = (id: string) => {
    setAddressPromise(fetchAddressWithUsers(id));
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 pt-6 pb-28 md:py-10">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {t.cards.mine}
          </h1>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            <span className="tabular-nums">{cards.length}</span>{" "}
            {cards.length === 1 ? t.cards.assignedUnitSingular : t.cards.assignedUnit} ·{" "}
            {t.cards.addressesCount.replace("{count}", String(totalAddresses))}
          </p>
        </div>

        {allAddresses.length > 0 && (
          <button
            type="button"
            onClick={() => setMapOpen(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          >
            <MapIcon className="size-4 text-brand" aria-hidden />
            {t.cards.seeMap}
          </button>
        )}
      </header>

      <MyCardsListView
        cards={cards}
        totalAddresses={totalAddresses}
        addressIndexMap={addressIndexMap}
        onOpenAddress={openAddress}
      />

      <MyCardsMapModal
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        addresses={allAddresses}
        onMarkerClick={openAddress}
      />

      <AddressDetailModal
        promise={addressPromise}
        organizationSlug={organizationSlug}
        onClose={() => setAddressPromise(null)}
      />
    </div>
  );
}
