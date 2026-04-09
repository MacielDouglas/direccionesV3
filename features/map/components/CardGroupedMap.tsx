"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { CardGroupedLayer, type GroupedAddress } from "../layers/CardGroupedLayer";
import { getCardColor } from "@/features/cards/utils/cardColors";

const MapboxProviderDynamic = dynamic(
  () => import("../core/MapboxProvider").then((m) => m.MapboxProvider),
  { ssr: false },
);

export type CardForMap = {
  id: string;
  number: number;
  addresses: {
    id: string;
    latitude: number | null;
    longitude: number | null;
    street: string;
    number: string;
    businessName: string | null;
  }[];
};

interface Props {
  cards: CardForMap[];
  selectedCardId: string | null;
  selectedAddressId: string | null;       // ← novo
  onSelectCard: (cardId: string) => void;
  onSelectAddress: (addressId: string, cardId: string) => void; // ← renomeado
}
export function CardGroupedMap({
  cards,
  selectedCardId,
  selectedAddressId,
  onSelectCard,
  onSelectAddress,
}: Props) {
  const groupedAddresses = useMemo<GroupedAddress[]>(() => {
    return cards.flatMap((card, cardIndex) =>
      card.addresses
        .filter((a) => a.latitude != null && a.longitude != null)
        .map((a) => ({
          id: a.id,
          label: a.businessName ?? `${a.street}, ${a.number}`,
          latitude: a.latitude!,
          longitude: a.longitude!,
          cardId: card.id,
          cardNumber: card.number,
          color: getCardColor(cardIndex),
        })),
    );
  }, [cards]);

  const hasAddresses = groupedAddresses.length > 0;

  if (!hasAddresses) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-xl border bg-muted text-sm text-muted-foreground">
        Sin coordenadas disponibles
      </div>
    );
  }

  return (
    <MapboxProviderDynamic>
      <CardGroupedLayer
        addresses={groupedAddresses}
        selectedCardId={selectedCardId}
        selectedAddressId={selectedAddressId}
        onAddressClick={(addressId, cardId) => {
          onSelectCard(cardId);
          onSelectAddress(addressId, cardId); // ← só seleciona, não abre modal
        }}
      />
    </MapboxProviderDynamic>
  );
}