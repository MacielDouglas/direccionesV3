"use client";

import { Button } from "@/components/ui/button";
import type { AddressWithUsers } from "@/features/addresses/types/address.types";
import { CardGroupedMap } from "@/features/map/components/CardGroupedMap";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { fetchAddressWithUsers } from "@/server/address/address.action";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { getCardColor } from "../../utils/cardColors";
import { AddressDetailModal } from "./AddressDetailModal";
import { CardListItem } from "./CardListItem";

type CardListClientCard = {
  id: string;
  number: number;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  ownerPersonId: string | null;
  createdByPersonId: string;
  updatedByPersonId: string | null;
  assignedPersonId: string | null;
  startDate: Date | null;
  endDate: Date | null;
  assignedTo: {
    id: string;
    name: string;
    user: { id: string; email: string; image: string | null } | null;
  } | null;
  addresses: {
    id: string;
    number: string;
    street: string;
    neighborhood: string;
    city: string;
    businessName: string | null;
    latitude: number | null;
    longitude: number | null;
    active: boolean;
  }[];
  events: {
    date: Date;
    person: { id: string; name: string; user: { image: string | null } | null } | null;
  }[];
};

interface Props {
  cards: CardListClientCard[];
  persons: {
    id: string;
    name: string;
    role: string | null;
    organizationId: string | null;
    user: { id: string; name: string; email: string; image: string | null } | null;
  }[];
  organizationSlug: string;
}

export function CardListClient({ cards, persons, organizationSlug }: Props) {
  const { t } = useI18n();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null); // ← novo
  const [addressPromise, setAddressPromise] = useState<Promise<AddressWithUsers | null> | null>(
    null,
  );

  const cardRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    cards.forEach((card, index) => {
      map.set(card.id, getCardColor(index));
    });
    return map;
  }, [cards]);

  const orderedCards = useMemo(() => {
    if (!selectedCardId) return cards;
    const selected = cards.find((c) => c.id === selectedCardId);
    if (!selected) return cards;
    return [selected, ...cards.filter((c) => c.id !== selectedCardId)];
  }, [cards, selectedCardId]);

  const handleSelectAddress = useCallback((addressId: string, cardId: string) => {
    setSelectedAddressId((prev) => (prev === addressId ? null : addressId)); // ← toggle
    setSelectedCardId(cardId);
  }, []);

  const handleSelectCard = useCallback((cardId: string) => {
    setSelectedCardId((prev) => {
      const next = prev === cardId ? null : cardId;
      if (next === null) setSelectedAddressId(null); // limpa endereço ao deselecionar
      return next;
    });

    requestAnimationFrame(() => {
      cardRefs.current.get(cardId)?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  }, []);

  const handleAddressClick = useCallback((addressId: string) => {
    setAddressPromise(fetchAddressWithUsers(addressId));
  }, []);

  return (
    <>
      {/* Mapa único — 50vh */}
      {cards.length > 0 && (
        <div className="sticky top-0 z-20 h-[50vh] w-full shrink-0 overflow-hidden border-b shadow-sm">
          <CardGroupedMap
            cards={cards}
            selectedCardId={selectedCardId}
            selectedAddressId={selectedAddressId}
            onSelectCard={handleSelectCard}
            onSelectAddress={handleSelectAddress}
          />

          {/* Botão limpar seleção de card */}
          {selectedCardId && (
            <button
              type="button"
              onClick={() => {
                setSelectedCardId(null);
                setSelectedAddressId(null);
              }}
              className="absolute bottom-3 left-3 z-10 rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold shadow backdrop-blur-sm transition hover:bg-background"
            >
              ✕ {t.admin.clearSelection}
            </button>
          )}

          {/* Botão limpar seleção de endereço — aparece quando tem endereço selecionado */}
          {selectedAddressId && (
            <button
              type="button"
              onClick={() => setSelectedAddressId(null)}
              className="absolute bottom-3 right-3 z-10 rounded-full bg-black/80 px-3 py-1.5 text-xs font-semibold text-white shadow backdrop-blur-sm transition hover:bg-black"
            >
              ✕ {t.admin.deselectPin}
            </button>
          )}
        </div>
      )}

      {/* Lista de cards */}
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t.admin.cardsTitle}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t.admin.cardsCount.replace("{count}", String(cards.length))}
            </p>
          </div>
          <Button asChild>
            <Link href={`/org/${organizationSlug}/admin/cards/new`}>
              <Plus className="mr-1.5 size-4" aria-hidden />
              {t.admin.newCard}
            </Link>
          </Button>
        </header>

        {cards.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="text-sm">{t.admin.noCardsCreated}</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4" aria-label={t.admin.cardListAria}>
            {orderedCards.map((card) => {
              // ← era cards.map
              const color = colorMap.get(card.id) ?? "#ef4444";
              const isSelected = selectedCardId === card.id;

              return (
                <li
                  key={card.id}
                  ref={(el) => {
                    if (el) cardRefs.current.set(card.id, el);
                    else cardRefs.current.delete(card.id);
                  }}
                >
                  <CardListItem
                    card={card}
                    persons={persons}
                    organizationSlug={organizationSlug}
                    color={color}
                    isSelected={isSelected}
                    onSelect={() => handleSelectCard(card.id)}
                    onAddressClick={handleAddressClick} // ← este ainda abre modal ao clicar na lista
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <AddressDetailModal
        promise={addressPromise}
        organizationSlug={organizationSlug}
        onClose={() => setAddressPromise(null)}
      />
    </>
  );
}
