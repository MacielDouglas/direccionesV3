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

  return (
    <div className="flex flex-col gap-6">
      <MyCardsListView
        cards={cards}
        organizationSlug={organizationSlug}
        totalAddresses={totalAddresses}
        onOpenAddress={openAddress}
      />

      <div className="flex flex-col gap-4">
        {allAddresses.length > 0 && (
          <button
            type="button"
            onClick={() => setMapOpen(true)}
            className="w-full sm:w-auto rounded-xl border border-border bg-card py-3 text-sm font-medium text-foreground shadow-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <MapIcon className="size-4 text-brand mr-2" aria-hidden />
            {t.cards.seeMap}
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

      {mapOpen && (
        <MyCardsMapModal
          open={mapOpen}
          onClose={() => setMapOpen(false)}
          addresses={allAddresses}
          onMarkerClick={openAddress}
        />
      )}
    </div>
  );
}
