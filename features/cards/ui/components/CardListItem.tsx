"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { CheckCircle, Circle, CircleAlert, Clock, MapPin, Pencil, User } from "lucide-react";
import Link from "next/link";
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
}

export function CardListItem({
  card,
  persons,
  organizationSlug,
  color,
  isSelected,
  onAddressClick,
}: CardItemProps) {
  const [assignOpen, setAssignOpen] = useState(false);
  const { t, locale } = useI18n();

  const isAssigned = !!card.assignedTo;
  const lastReturn = card.events[0] ?? null;

  return (
    <>
      <article
        style={isSelected ? { outline: `2px solid ${color}`, outlineOffset: "2px" } : undefined}
        className={cn(
          "rounded-xl border bg-card p-4 flex flex-col gap-3 shadow-sm cursor-pointer",
          "transition-all duration-200",
          isSelected ? "shadow-md" : "hover:shadow-md hover:border-border/80",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Bolinha colorida de identificação */}
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow"
              style={{ backgroundColor: color }}
              aria-hidden
            >
              {String(card.number).padStart(2, "0")}
            </span>

            <span className="text-lg font-bold tabular-nums">
              #{String(card.number).padStart(2, "0")}
            </span>

            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                isAssigned
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "text-blue-500 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
              )}
            >
              {isAssigned ? (
                <>
                  <CheckCircle className="size-3" aria-hidden />
                  {t.cards.assigned}
                </>
              ) : (
                <>
                  <Circle className="size-3" aria-hidden />
                  {t.cards.free}
                </>
              )}
            </span>
            <p className="font-bold text-xs">
              {Array.from(
                new Set(
                  card.addresses
                    .map((item) => item.neighborhood?.trim())
                    .filter((item): item is string => !!item),
                ),
              ).join(", ")}
            </p>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {!isAssigned && (
              <Button size="sm" onClick={() => setAssignOpen(true)}>
                <User className="size-4 mr-1.5" aria-hidden />
                {t.admin.assignVerb}
              </Button>
            )}
            {isAssigned && (
              <ReturnCardButton
                cardId={card.id}
                cardNumber={card.number}
                organizationSlug={organizationSlug}
              />
            )}
            <Button asChild size="sm" variant="outline">
              <Link href={`/org/${organizationSlug}/admin/cards/${card.id}/edit`}>
                <Pencil className="size-4 mr-1.5" aria-hidden />
                {t.admin.edit}
              </Link>
            </Button>
            <DeleteCardButton
              cardId={card.id}
              cardNumber={card.number}
              organizationSlug={organizationSlug}
            />
          </div>
        </div>

        {/* Pessoa atribuída */}
        {isAssigned && card.assignedTo && (
          <div className="flex items-center gap-2 text-sm">
            <User className="size-4 text-muted-foreground shrink-0" aria-hidden />
            <span>
              <span className="font-medium">{card.assignedTo.name}</span>
              {card.startDate && (
                <span className="text-muted-foreground ml-1">
                  {t.cards.since}{" "}
                  {new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "es-419").format(
                    new Date(card.startDate),
                  )}
                </span>
              )}
            </span>
          </div>
        )}

        {/* Último retorno */}
        {!isAssigned && lastReturn?.person && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="size-3.5 shrink-0" aria-hidden />
            <span>
              {t.admin.lastReturn.replace("{name}", lastReturn.person.name)}
              {" — "}
              {new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "es-419").format(
                new Date(lastReturn.date),
              )}
            </span>
          </div>
        )}

        {/* Endereços */}
        <ul className="flex flex-col gap-1" aria-label={t.admin.linkedAddresses}>
          {card.addresses.map((addr) => (
            <li key={addr.id}>
              <button
                type="button"
                onClick={() => onAddressClick(addr.id)}
                className="w-full flex items-start gap-1.5 text-sm text-muted-foreground
                  hover:text-foreground hover:bg-muted/50 rounded-md px-1 py-0.5 transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-left"
                aria-label={t.admin.addressDetails.replace(
                  "{name}",
                  addr.businessName ?? addr.street,
                )}
              >
                <MapPin className="size-3.5 mt-0.5 shrink-0" style={{ color }} aria-hidden />
                {!addr.active && (
                  <CircleAlert className="size-4 shrink-0 text-red-500 animate-ping" aria-hidden />
                )}
                <span className="truncate">
                  {addr.businessName && (
                    <span className="font-medium text-foreground">{addr.businessName} — </span>
                  )}
                  {addr.street}, {addr.number}, {addr.neighborhood}, {addr.city}
                </span>
              </button>
            </li>
          ))}
        </ul>
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
