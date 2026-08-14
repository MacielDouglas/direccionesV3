"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AddressWithUsers } from "@/features/addresses/types/address.types";
import { CardGroupedMap } from "@/features/map/components/CardGroupedMap";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { fetchAddressWithUsers } from "@/server/address/address.action";
import { CreditCard, Plus, Search } from "lucide-react";
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
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addressPromise, setAddressPromise] = useState<Promise<AddressWithUsers | null> | null>(
    null,
  );
  const [filter, setFilter] = useState<"all" | "assigned" | "available">("all");
  const [query, setQuery] = useState("");

  const cardRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    cards.forEach((card, index) => {
      map.set(card.id, getCardColor(index));
    });
    return map;
  }, [cards]);

  const filteredCards = useMemo(() => {
    const q = query.trim().toLowerCase();

    return cards.filter((card) => {
      if (filter === "assigned" && !card.assignedTo) return false;
      if (filter === "available" && card.assignedTo) return false;

      if (!q) return true;
      if (String(card.number).includes(q)) return true;

      return card.addresses.some((addr) =>
        [addr.street, addr.neighborhood, addr.city, addr.businessName]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q)),
      );
    });
  }, [cards, filter, query]);

  const orderedCards = useMemo(() => {
    if (!selectedCardId) return filteredCards;
    const selected = filteredCards.find((c) => c.id === selectedCardId);
    if (!selected) return filteredCards;
    return [selected, ...filteredCards.filter((c) => c.id !== selectedCardId)];
  }, [filteredCards, selectedCardId]);

  const assignedCount = useMemo(() => cards.filter((c) => c.assignedTo).length, [cards]);
  const availableCount = cards.length - assignedCount;

  const isFiltering = filter !== "all" || query.trim().length > 0;

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
    <main className="mx-auto w-full max-w-3xl px-4 py-6 md:py-10" aria-labelledby="cards-heading">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">
            {t.admin.title}
          </p>
          <h1 id="cards-heading" className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {t.admin.cardsTitle}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.admin.cardsDescription}</p>
        </div>
        <Button asChild>
          <Link href={`/org/${organizationSlug}/admin/cards/new`}>
            <Plus className="mr-1.5 size-4" aria-hidden />
            {t.admin.newCard}
          </Link>
        </Button>
      </header>

      <div className="space-y-8">
        {/* Mapa único — sticky */}
        {cards.length > 0 && (
          <section
            aria-label={t.admin.cardsTitle}
            className="sticky top-0 z-20 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            <div className="h-[45vh] w-full">
              <CardGroupedMap
                cards={cards}
                selectedCardId={selectedCardId}
                selectedAddressId={selectedAddressId}
                onSelectCard={handleSelectCard}
                onSelectAddress={handleSelectAddress}
              />
            </div>

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

            {/* Botão limpar seleção de endereço */}
            {selectedAddressId && (
              <button
                type="button"
                onClick={() => setSelectedAddressId(null)}
                className="absolute bottom-3 right-3 z-10 rounded-full bg-black/80 px-3 py-1.5 text-xs font-semibold text-white shadow backdrop-blur-sm transition hover:bg-black"
              >
                ✕ {t.admin.deselectPin}
              </button>
            )}
          </section>
        )}

        {/* Busca e filtros — logo abaixo do mapa */}
        <section aria-label={t.admin.searchCardsAria} className="flex flex-col gap-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.admin.searchCardsPlaceholder}
              aria-label={t.admin.searchCardsAria}
              className="h-11 rounded-xl border-border bg-card pl-9 shadow-xs"
            />
          </div>

          <fieldset
            aria-label={t.admin.cardListAria}
            className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-card p-1 shadow-xs"
          >
            {(
              [
                { key: "all", label: t.admin.filterAll, count: cards.length },
                { key: "assigned", label: t.admin.filterDesignated, count: assignedCount },
                { key: "available", label: t.admin.filterAvailable, count: availableCount },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                aria-pressed={filter === item.key}
                onClick={() => setFilter(item.key)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                  filter === item.key
                    ? "bg-brand text-brand-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    filter === item.key ? "text-brand-foreground/80" : "text-muted-foreground/70",
                  )}
                >
                  {item.count}
                </span>
              </button>
            ))}
          </fieldset>
        </section>

        {/* Lista de cards */}
        <section aria-labelledby="cards-list-heading">
          <h2
            id="cards-list-heading"
            className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground"
          >
            <CreditCard className="size-4 text-brand" aria-hidden="true" />
            {t.admin.cardsTitle}
            <span className="text-xs font-normal text-muted-foreground">
              {isFiltering
                ? t.admin.cardsCount.replace("{count}", String(filteredCards.length))
                : t.admin.cardsCount.replace("{count}", String(cards.length))}
            </span>
          </h2>

          {cards.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16 text-center text-sm text-muted-foreground">
              <CreditCard className="size-6" aria-hidden />
              <p>{t.admin.noCardsCreated}</p>
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16 text-center text-sm text-muted-foreground">
              <Search className="size-6" aria-hidden />
              <p>{t.admin.searchNoResults}</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4" aria-label={t.admin.cardListAria}>
              {orderedCards.map((card) => {
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
                      onAddressClick={handleAddressClick}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <AddressDetailModal
        promise={addressPromise}
        organizationSlug={organizationSlug}
        onClose={() => setAddressPromise(null)}
      />
    </main>
  );
}
