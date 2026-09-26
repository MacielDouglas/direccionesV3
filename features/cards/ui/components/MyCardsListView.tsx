"use client";

import { ADDRESS_TYPE_OPTIONS } from "@/features/addresses/domain/constants/address.constants";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  CircleAlert,
  Clock,
  CreditCard,
  Map as MapIcon,
  MapPin,
  MapPinned,
} from "lucide-react";
import { getCardColor } from "../../utils/cardColors";

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
  onOpenAddress: (id: string) => void;
  onOpenCardMap: (cardId: string) => void;
}

function formatSince(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "es-419", {
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

export function MyCardsListView({ cards, totalAddresses, onOpenAddress, onOpenCardMap }: Props) {
  const { t, locale } = useI18n();
  const activeAddresses = cards.reduce(
    (total, card) => total + card.addresses.filter((a) => a.active).length,
    0,
  );

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card px-4 py-10 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-muted">
          <CreditCard className="size-8 text-muted-foreground/60" aria-hidden />
        </span>
        <div>
          <p className="text-base font-semibold tracking-tight text-foreground">
            {t.cards.emptyTitle}
          </p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            {t.cards.emptyDescription}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Resumo estilo banco */}
      <section
        aria-label={t.cards.summary}
        className="rounded-2xl bg-black p-5 text-white shadow-xs shadow-black/20"
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
      <ul className="flex flex-col gap-4" aria-label={t.cards.mine}>
        {cards.map((card, index) => {
          const color = getCardColor(index);
          const neighborhoods = neighborhoodsOf(card.addresses);
          const cardNumber = String(card.number).padStart(2, "0");
          const hasActive = card.addresses.some((a) => a.active);
          const mappableCount = card.addresses.filter(
            (a) => a.latitude != null && a.longitude != null,
          ).length;

          return (
            <li key={card.id}>
              <article
                aria-label={`${t.cards.title} #${cardNumber}`}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_12px_32px_-12px_rgba(0,0,0,0.35)] transition-shadow duration-300 hover:shadow-[0_20px_44px_-12px_rgba(0,0,0,0.45)]"
              >
                {/* Cartão 3D estilo banco */}
                <div
                  className="relative overflow-hidden px-5 pb-5 pt-4 text-white"
                  style={{
                    background: `linear-gradient(135deg, ${color} 0%, color-mix(in srgb, ${color} 55%, black) 100%)`,
                  }}
                >
                  {/* Luz superior + sombra inferior: volume */}
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-white/5 to-black/30"
                    aria-hidden="true"
                  />
                  {/* Reflexo diagonal */}
                  <div
                    className="pointer-events-none absolute -left-1/4 top-0 h-full w-1/2 rotate-[20deg] bg-gradient-to-r from-transparent via-white/15 to-transparent"
                    aria-hidden="true"
                  />
                  <div
                    className="pointer-events-none absolute -right-10 -top-12 size-36 rounded-full bg-white/10 blur-[1px]"
                    aria-hidden="true"
                  />
                  <div
                    className="pointer-events-none absolute -right-2 top-10 size-16 rounded-full bg-white/10"
                    aria-hidden="true"
                  />
                  {/* Fio de luz no topo + base escura: borda 3D */}
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/50"
                    aria-hidden="true"
                  />
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-black/25"
                    aria-hidden="true"
                  />

                  <div className="relative flex items-center justify-between gap-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
                      {t.admin.cardBadgeLabel}
                    </p>

                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 text-xs font-semibold shadow-[0_2px_6px_rgba(0,0,0,0.35)] ring-1 ring-white/20 ring-inset backdrop-blur-sm",
                        hasActive ? "text-white" : "text-white/70",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          hasActive ? "bg-emerald-400" : "bg-white/40",
                        )}
                        aria-hidden
                      />
                      {t.cards.active}
                    </span>
                  </div>

                  <div className="relative mt-3">
                    <p className="text-3xl font-bold leading-none tabular-nums tracking-tight drop-shadow-[0_2px_3px_rgba(0,0,0,0.45)]">
                      #{cardNumber}
                    </p>
                  </div>
                </div>

                {/* Corpo */}
                <div className="flex flex-col gap-3 p-5">
                  {card.startDate && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="size-3.5 shrink-0" aria-hidden />
                      <span>
                        {t.cards.since} {formatSince(card.startDate, locale)}
                      </span>
                    </div>
                  )}

                  {/* Bairros (únicos, sem destaque) */}
                  {neighborhoods.length > 0 && (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                      <MapPin className="size-3 shrink-0" aria-hidden />
                      <span className="truncate">{neighborhoods.join(" · ")}</span>
                    </p>
                  )}

                  {/* Endereços com o número do pin do mapa */}
                  <ul
                    className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/60 bg-muted/20"
                    aria-label={t.common.addresses}
                  >
                    {card.addresses.map((addr) => {
                      const typeConfig = ADDRESS_TYPE_OPTIONS.find(
                        (opt) => opt.value === addr.type,
                      );
                      const TypeIcon = typeConfig?.icon ?? MapPin;
                      return (
                        <li key={addr.id}>
                          <button
                            type="button"
                            onClick={() => onOpenAddress(addr.id)}
                            className="flex min-h-11 w-full items-start gap-2.5 px-3 py-3 text-left text-sm transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                            aria-label={`${t.cards.viewDetails}: ${addr.businessName ?? `${addr.street}, ${addr.number}`}`}
                          >
                            <TypeIcon
                              className={cn("mt-0.5 size-4 shrink-0", typeConfig?.color)}
                              aria-hidden
                            />
                            <span className="min-w-0 flex-1">
                              {addr.businessName && (
                                <span className="block truncate text-xs font-semibold text-foreground">
                                  {addr.businessName}
                                </span>
                              )}
                              <span
                                className={cn(
                                  "block truncate text-muted-foreground",
                                  addr.pendingDeletionAt && "line-through",
                                )}
                              >
                                {addr.street}, {addr.number}
                                {addr.neighborhood ? ` — ${addr.neighborhood}` : ""}
                                {addr.city ? `, ${addr.city}` : ""}
                              </span>
                            </span>
                            {!addr.active && (
                              <CircleAlert
                                className="size-4 shrink-0 animate-pulse text-red-500"
                                aria-hidden
                              />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Mapa do cartão */}
                  {mappableCount > 0 && (
                    <button
                      type="button"
                      onClick={() => onOpenCardMap(card.id)}
                      aria-label={`${t.cards.seeMap} — ${t.cards.cardNumber.replace("{number}", cardNumber)}`}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-semibold text-foreground shadow-xs transition-colors hover:border-brand/50 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      <MapIcon className="size-4 shrink-0 text-brand" aria-hidden />
                      {t.cards.seeMap}
                      <span
                        aria-hidden
                        className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-bold tabular-nums text-brand"
                      >
                        {mappableCount}
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    </button>
                  )}
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
