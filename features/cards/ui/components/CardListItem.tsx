"use client";

import { useState } from "react";
import { MapPin, User, Clock, Circle, Pencil, CheckCircle } from "lucide-react";
import { AssignCardModal } from "./AssignCardModal";
import { ReturnCardButton } from "./ReturnCardButton";
import { DeleteCardButton } from "./DeleteCardButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CardViewMap } from "@/features/map/components/CardViewMap";
import { AddressDetailModal } from "./AddressDetailModal";
import Link from "next/link";
import { fetchAddressWithUsers } from "@/server/address/address.action";
import { AddressWithUsers } from "@/features/addresses/types/address.types";

interface CardItemProps {
  card: {
    id: string;
    number: number;
    assignedUser: {
      id: string;
      name: string;
      email: string;
      image: string | null;
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
    }[];
    events: { date: Date; user: { name: string } }[];
  };
  members: {
    user: { id: string; name: string; email: string; image: string | null };
  }[];
  organizationSlug: string;
}

export function CardListItem({
  card,
  members,
  organizationSlug,
}: CardItemProps) {
  const [assignOpen, setAssignOpen] = useState(false);
  const [addressPromise, setAddressPromise] =
    useState<Promise<AddressWithUsers | null> | null>(null);

  // openAddress usando o server action
  const openAddress = (id: string) => {
    setAddressPromise(fetchAddressWithUsers(id));
  };

  const isAssigned = !!card.assignedUser;
  const lastReturn = card.events[0] ?? null;

  return (
    <>
      <article
        aria-label={`Card #${String(card.number).padStart(2, "0")}`}
        className="rounded-xl border bg-card p-4 flex flex-col gap-3 shadow-sm"
      >
        {/* Header — igual ao anterior */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
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
                  Asignado
                </>
              ) : (
                <>
                  <Circle className="size-3" aria-hidden />
                  Libre
                </>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {!isAssigned && (
              <Button size="sm" onClick={() => setAssignOpen(true)}>
                <User className="size-4 mr-1.5" aria-hidden />
                Asignar
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
              <Link
                href={`/org/${organizationSlug}/admin/cards/${card.id}/edit`}
              >
                <Pencil className="size-4 mr-1.5" aria-hidden />
                Editar
              </Link>
            </Button>
            <DeleteCardButton
              cardId={card.id}
              cardNumber={card.number}
              organizationSlug={organizationSlug}
            />
          </div>
        </div>

        {/* Usuário atribuído */}
        {isAssigned && card.assignedUser && (
          <div className="flex items-center gap-2 text-sm">
            <User
              className="size-4 text-muted-foreground shrink-0"
              aria-hidden
            />
            <span>
              <span className="font-medium">{card.assignedUser.name}</span>
              {card.startDate && (
                <span className="text-muted-foreground ml-1">
                  desde {new Date(card.startDate).toLocaleDateString("es-419")}
                </span>
              )}
            </span>
          </div>
        )}

        {/* Último retorno */}
        {!isAssigned && lastReturn && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="size-3.5 shrink-0" aria-hidden />
            <span>
              Último:{" "}
              <span className="font-medium">{lastReturn.user.name}</span>
              {" — "}
              {new Date(lastReturn.date).toLocaleDateString("es-419")}
            </span>
          </div>
        )}

        {/* Addresses — clicáveis */}
        <ul
          className="flex flex-col gap-1"
          aria-label="Direcciones de la tarjeta"
        >
          {card.addresses.map((addr) => (
            <li key={addr.id}>
              <button
                type="button"
                onClick={() => openAddress(addr.id)}
                className="w-full flex items-start gap-1.5 text-sm text-muted-foreground
                  hover:text-foreground hover:bg-muted/50 rounded-md px-1 py-0.5 transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-left"
                aria-label={`Ver detalles: ${addr.businessName ?? addr.street}`}
              >
                <MapPin
                  className="size-3.5 mt-0.5 shrink-0 text-red-500"
                  aria-hidden
                />
                <span className="truncate">
                  {addr.businessName && (
                    <span className="font-medium text-foreground">
                      {addr.businessName} —{" "}
                    </span>
                  )}
                  {addr.street}, {addr.number}, {addr.neighborhood}, {addr.city}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* Mapa — markers clicáveis */}
        <CardViewMap
          addresses={card.addresses
            .filter((a) => a.latitude != null && a.longitude != null)
            .map((a) => ({
              id: a.id,
              label: a.businessName ?? `${a.street}, ${a.number}`,
              latitude: a.latitude!,
              longitude: a.longitude!,
            }))}
          onMarkerClick={openAddress}
        />
      </article>

      <AssignCardModal
        cardId={card.id}
        cardNumber={card.number}
        members={members}
        organizationSlug={organizationSlug}
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
      />

      <AddressDetailModal
        promise={addressPromise}
        organizationSlug={organizationSlug}
        onClose={() => setAddressPromise(null)}
      />
    </>
  );
}
