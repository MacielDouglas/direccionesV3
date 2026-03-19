"use client";

import { useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { ReturnCardButton } from "./ReturnCardButton";
import { CardViewMap } from "@/features/map/components/CardViewMap";
import { AddressDetailModal } from "./AddressDetailModal";
import type { AddressWithUsers } from "@/features/addresses/types/address.types";
import { fetchAddressWithUsers } from "@/server/address/address.action";

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
}

export function MyCardsClient({ cards, organizationSlug }: Props) {
  const [addressPromise, setAddressPromise] =
    useState<Promise<AddressWithUsers | null> | null>(null);

  const { allAddresses, addressIndexMap } = useMemo(() => {
    const addresses = cards
      .flatMap((card) => card.addresses)
      .filter((a) => a.latitude != null && a.longitude != null)
      .map((a) => ({
        id: a.id,
        label: a.businessName ?? `${a.street}, ${a.number}`,
        latitude: a.latitude!,
        longitude: a.longitude!,
      }));

    return {
      allAddresses: addresses,
      addressIndexMap: new Map(addresses.map((a, i) => [a.id, i + 1])),
    };
  }, [cards]);

  // ✅ chama o server action e armazena a promise
  const openAddress = (id: string) => {
    setAddressPromise(fetchAddressWithUsers(id));
  };

  return (
    <div className="flex flex-col h-dvh">
      {allAddresses.length > 0 && (
        <div className="h-64 shrink-0 w-full">
          <CardViewMap addresses={allAddresses} onMarkerClick={openAddress} />
        </div>
      )}

      <main className="flex-1 overflow-y-auto px-4 py-4">
        <header className="mb-4">
          <h1 className="text-2xl font-bold">Mis Tarjetas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {cards.length} tarjeta{cards.length !== 1 ? "s" : ""} asignada
            {cards.length !== 1 ? "s" : ""}
          </p>
        </header>

        {cards.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">No tienes tarjetas asignadas.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4" aria-label="Mis tarjetas">
            {cards.map((card) => (
              <li key={card.id}>
                <article
                  aria-label={`Tarjeta #${String(card.number).padStart(2, "0")}`}
                  className="rounded-xl border bg-card p-4 flex flex-col gap-3 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-lg font-bold tabular-nums">
                      #{String(card.number).padStart(2, "0")}
                    </span>
                    <ReturnCardButton
                      cardId={card.id}
                      cardNumber={card.number}
                      organizationSlug={organizationSlug}
                    />
                  </div>

                  {card.startDate && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="size-3.5 shrink-0" aria-hidden />
                      Recibido el{" "}
                      {new Date(card.startDate).toLocaleDateString("es-419")}
                    </div>
                  )}

                  <ul className="flex flex-col gap-1" aria-label="Direcciones">
                    {card.addresses.map((addr) => {
                      const index = addressIndexMap.get(addr.id);
                      return (
                        <li key={addr.id}>
                          <button
                            type="button"
                            onClick={() => openAddress(addr.id)}
                            className="w-full flex items-center gap-2 text-sm
                              text-blue-600 dark:text-blue-400
                              hover:text-blue-800 dark:hover:text-blue-300
                              hover:bg-blue-50 dark:hover:bg-blue-950/30
                              rounded-md px-1 py-0.5 transition-colors text-left
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label={`Ver detalles: ${addr.businessName ?? addr.street}`}
                          >
                            {index != null && (
                              <span
                                className="flex shrink-0 size-5 items-center justify-center
                                  rounded-full bg-red-500 text-white text-xs font-bold"
                                aria-hidden
                              >
                                {index}
                              </span>
                            )}
                            <span
                              className={`truncate ${addr.pendingDeletionAt ? "line-through" : ""}`}
                            >
                              {addr.businessName && (
                                <span className="font-medium">
                                  {addr.businessName} —{" "}
                                </span>
                              )}
                              {addr.street}, {addr.number}, {addr.neighborhood},{" "}
                              {addr.city}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </article>
              </li>
            ))}
          </ul>
        )}
      </main>

      <AddressDetailModal
        promise={addressPromise}
        organizationSlug={organizationSlug}
        onClose={() => setAddressPromise(null)}
      />
    </div>
  );
}
