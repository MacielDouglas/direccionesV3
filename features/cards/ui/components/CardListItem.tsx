"use client";

import { Button } from "@/components/ui/button";
import { ADDRESS_TYPE_OPTIONS } from "@/features/addresses/domain/constants/address.constants";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { CheckCircle, Circle, CircleAlert, Clock, MapPin, Pencil, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { AssignCardModal } from "./AssignCardModal";
import { DeleteCardButton } from "./DeleteCardButton";
import { ReturnCardButton } from "./ReturnCardButton";

interface CardItemProps {
  card: {
    id: string;
    number: number;
    assignedTo: {
      id: string;
      name: string;
      user: { id: string; email: string; image: string | null } | null;
    } | null;
    startDate: Date | null;
    addresses: {
      id: string;
      type: string;
      street: string;
      number: string;
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
  persons: {
    id: string;
    name: string;
    role: string | null;
    organizationId: string | null;
    user: { id: string; name: string; email: string; image: string | null } | null;
  }[];
  organizationSlug: string;
  color: string;
  isSelected: boolean;
  onSelect: () => void;
  onAddressClick: (addressId: string) => void;
  onEditCard: (cardId: string) => void;
}

export function CardListItem({
  card,
  persons,
  organizationSlug,
  color,
  isSelected,
  onAddressClick,
  onEditCard,
}: CardItemProps) {
  const [assignOpen, setAssignOpen] = useState(false);
  const { t, locale } = useI18n();

  const isAssigned = !!card.assignedTo;
  const lastReturn = card.events[0] ?? null;
  const cardNumber = String(card.number).padStart(2, "0");
  const dateFormat = new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "es-419");
  const assignedImage = card.assignedTo?.user?.image ?? null;
  const assignedInitial = card.assignedTo?.name?.charAt(0).toUpperCase() ?? "?";

  const neighborhoods = card.addresses.reduce<string[]>((list, addr) => {
    const neighborhood = addr.neighborhood?.trim();
    if (neighborhood && !list.includes(neighborhood)) list.push(neighborhood);
    return list;
  }, []);

  return (
    <>
      <article
        style={isSelected ? { outline: `2px solid ${color}`, outlineOffset: "2px" } : undefined}
        className={cn(
          "group overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all duration-200",
          isSelected ? "shadow-md" : "hover:shadow-md hover:border-border/80",
        )}
      >
        {/* ── Banner estilo cartão de banco ── */}
        <div
          className="relative overflow-hidden px-5 py-4 text-white"
          style={{
            background: `linear-gradient(135deg, ${color} 0%, color-mix(in srgb, ${color} 55%, #000) 100%)`,
          }}
        >
          {/* Decoração translúcida */}
          <div
            className="pointer-events-none absolute -right-10 -top-12 size-36 rounded-full bg-white/10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-2 top-8 size-16 rounded-full bg-white/10"
            aria-hidden="true"
          />

          <div className="relative flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/15 text-sm font-bold tabular-nums backdrop-blur-sm">
                {cardNumber}
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
                  {t.admin.cardBadgeLabel}
                </p>
                <p className="text-2xl font-bold leading-none tabular-nums tracking-tight">
                  #{cardNumber}
                </p>
              </div>
            </div>

            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm",
                isAssigned ? "text-white" : "text-white",
              )}
            >
              {isAssigned ? (
                <>
                  <CheckCircle className="size-3.5" aria-hidden />
                  {t.cards.assigned}
                </>
              ) : (
                <>
                  <Circle className="size-3.5" aria-hidden />
                  {t.cards.free}
                </>
              )}
            </span>
          </div>
        </div>

        {/* ── Corpo ── */}
        <div className="flex flex-col gap-3 p-5">
          {/* Pessoa designada */}
          {isAssigned && card.assignedTo && (
            <div className="flex items-center gap-3">
              {assignedImage ? (
                <Image
                  src={assignedImage}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 shrink-0 rounded-full object-cover"
                  aria-hidden="true"
                />
              ) : (
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                >
                  {assignedInitial}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {card.assignedTo.name}
                </p>
                {card.startDate && (
                  <p className="truncate text-xs text-muted-foreground">
                    {t.cards.since} {dateFormat.format(new Date(card.startDate))}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Último retorno */}
          {!isAssigned && lastReturn?.person && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="size-3.5 shrink-0" aria-hidden />
              <span>
                {t.admin.lastReturn.replace("{name}", lastReturn.person.name)}
                {" — "}
                {dateFormat.format(new Date(lastReturn.date))}
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

          {/* Endereços */}
          {card.addresses.length > 0 && (
            <ul
              className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/60 bg-muted/20"
              aria-label={t.admin.linkedAddresses}
            >
              {card.addresses.map((addr) => {
                const typeConfig = ADDRESS_TYPE_OPTIONS.find((opt) => opt.value === addr.type);
                const TypeIcon = typeConfig?.icon ?? MapPin;

                return (
                  <li key={addr.id}>
                    <button
                      type="button"
                      onClick={() => onAddressClick(addr.id)}
                      className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      aria-label={t.admin.addressDetails.replace(
                        "{name}",
                        addr.businessName ?? addr.street,
                      )}
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
                        <span className="block truncate text-muted-foreground">
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
          )}

          {/* ── Ações (clareza estilo Estapar) ── */}
          <div className="mt-1 flex items-center gap-1 border-t border-border/60 pt-3">
            {!isAssigned ? (
              <Button size="sm" onClick={() => setAssignOpen(true)}>
                <User className="mr-1.5 size-4" aria-hidden />
                {t.admin.assignVerb}
              </Button>
            ) : (
              <ReturnCardButton
                cardId={card.id}
                cardNumber={card.number}
                organizationSlug={organizationSlug}
              />
            )}

            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => onEditCard(card.id)}
            >
              <Pencil className="mr-1.5 size-4" aria-hidden />
              {t.admin.edit}
            </Button>

            <div className="ml-auto flex items-center gap-1">
              <DeleteCardButton
                cardId={card.id}
                cardNumber={card.number}
                organizationSlug={organizationSlug}
              />
            </div>
          </div>
        </div>
      </article>

      <AssignCardModal
        cardId={card.id}
        cardNumber={card.number}
        persons={persons}
        organizationSlug={organizationSlug}
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
      />
    </>
  );
}
