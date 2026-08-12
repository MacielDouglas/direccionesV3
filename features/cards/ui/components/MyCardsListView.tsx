"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { CircleAlert, Clock, CreditCard, MapPin, MapPinned } from "lucide-react";
import { getCardColor } from "../../utils/cardColors";

type CardAddress = {
  id: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  businessName: string | null;
  pendingDeletionAt: Date | null;
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
  totalAddresses: number;
  addressIndexMap: Map<string, number>;
  onOpenAddress: (id: string) => void;
}

function formatSince(date: Date) {
  return new Intl.DateTimeFormat("es-419", {
    timeZone: "America/Bogota",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function neighborhoodsOf(addresses: CardAddress[]) {
  return Array.from(
    new Set(
      addresses.map((item) => item.neighborhood?.trim()).filter((item): item is string => !!item),
    ),
  );
}

export function MyCardsListView({ cards, totalAddresses, addressIndexMap, onOpenAddress }: Props) {
  const { t } = useI18n();
  const activeAddresses = cards.reduce(
    (total, card) => total + card.addresses.filter((a) => a.active).length,
    0,
  );

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-muted">
          <CreditCard className="size-8 text-muted-foreground/60" aria-hidden />
        </span>
        <div>
          <p className="text-base font-semibold text-foreground">{t.cards.emptyTitle}</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            {t.cards.emptyDescription}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Resumo estilo banco */}
      <section
        aria-label={t.cards.summary}
        className="rounded-2xl bg-black p-5 text-white shadow-md shadow-black/20"
      >
        <span className="inline-flex items-center gap-2 text-[0.625rem] font-medium uppercase tracking-widest text-neutral-400">
          <CreditCard className="size-4 text-brand" aria-hidden />
          {t.cards.summary}
        </span>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-5xl font-bold leading-none tabular-nums">{cards.length}</span>
          <span className="text-sm font-medium text-neutral-300">
            {cards.length === 1 ? t.cards.assignedUnitSingular : t.cards.assignedUnit}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
          <span className="inline-flex items-center gap-1.5">
            <MapPinned className="size-3.5 text-brand" aria-hidden />
            {t.cards.addressesCount.replace("{count}", String(totalAddresses))}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
            {t.cards.activeAddresses.replace("{count}", String(activeAddresses))}
          </span>
        </div>
      </section>

      {/* Lista de cards */}
      <ul className="flex flex-col gap-3" aria-label={t.cards.mine}>
        {cards.map((card, index) => {
          const color = getCardColor(index);
          const neighborhoods = neighborhoodsOf(card.addresses);
          return (
            <li key={card.id}>
              <article
                aria-label={`${t.cards.title} #${String(card.number).padStart(2, "0")}`}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs"
              >
                <header className="flex items-center gap-3 border-b border-border px-4 py-3.5">
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: color }}
                    aria-hidden
                  >
                    {String(card.number).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold tabular-nums leading-none">
                        #{String(card.number).padStart(2, "0")}
                      </span>
                      {card.startDate && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" aria-hidden />
                          {t.cards.since} {formatSince(card.startDate)}
                        </span>
                      )}
                    </div>
                    {neighborhoods.length > 0 && (
                      <p className="mt-1 truncate text-xs font-medium text-muted-foreground">
                        {neighborhoods.join(" · ")}
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold",
                      card.addresses.some((a) => a.active)
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <span className="size-1.5 rounded-full bg-current" aria-hidden />
                    {t.cards.active}
                  </span>
                </header>

                <ul className="divide-y divide-border" aria-label={t.common.addresses}>
                  {card.addresses.map((addr) => {
                    const index = addressIndexMap.get(addr.id);
                    const label = addr.businessName ?? `${addr.street}, ${addr.number}`;
                    return (
                      <li key={addr.id}>
                        <button
                          type="button"
                          onClick={() => onOpenAddress(addr.id)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                          aria-label={`${t.cards.viewDetails}: ${label}`}
                        >
                          <span
                            className={cn(
                              "flex size-6 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-bold",
                              index != null
                                ? "bg-brand text-brand-foreground"
                                : "bg-muted text-muted-foreground",
                            )}
                            aria-hidden
                          >
                            {index ?? "·"}
                          </span>
                          {!addr.active && (
                            <CircleAlert
                              className="size-4 shrink-0 text-red-500 animate-ping"
                              aria-hidden
                            />
                          )}
                          <span className="min-w-0 flex-1">
                            {addr.businessName && (
                              <span className="block truncate text-sm font-medium text-foreground">
                                {addr.businessName}
                              </span>
                            )}
                            <span
                              className={cn(
                                "block truncate text-xs text-muted-foreground",
                                addr.pendingDeletionAt && "line-through",
                              )}
                            >
                              {addr.street}, {addr.number} · {addr.neighborhood}, {addr.city}
                            </span>
                          </span>
                          <MapPin
                            className="size-4 shrink-0 text-muted-foreground/70"
                            style={{ color }}
                            aria-hidden
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
