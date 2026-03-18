"use client";

import { useState } from "react";
import { Clock, User, Info, Pencil } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { AgendaEventItem as TAgendaEventItem } from "../types/agenda.types";
import { DeleteAgendaEventButton } from "./ui/DeleteAgendaEventButton";
import { EditAgendaEventModal } from "./EditAgendaEventModal";
import { Button } from "@/components/ui/button";

interface Member {
  user: { id: string; name: string; image: string | null };
}

interface Props {
  event: TAgendaEventItem;
  organizationSlug: string;
  canDelete?: boolean;
  canEdit?: boolean;
  members?: Member[];
}

export function AgendaEventItem({
  event,
  organizationSlug,
  canDelete,
  canEdit,
  members = [],
}: Props) {
  const [editOpen, setEditOpen] = useState(false);

  const date = new Date(event.date);
  const isPast = date < new Date();

  const dateStr = date.toLocaleDateString("es-419", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const timeStr = date.toLocaleTimeString("es-419", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <>
      <article
        className={cn(
          "rounded-xl border bg-card p-4 flex flex-col gap-2 shadow-sm transition-opacity",
          isPast && "opacity-50",
        )}
        aria-label={isPast ? `Evento pasado: ${dateStr}` : `Evento: ${dateStr}`}
      >
        <header className="flex items-start justify-between gap-2">
          <time
            dateTime={date.toISOString()}
            className={cn(
              "text-sm font-semibold capitalize text-foreground",
              isPast && "line-through",
            )}
          >
            {dateStr}
          </time>

          <div className="flex items-center gap-1 shrink-0">
            <span
              className={cn(
                "flex items-center gap-1 text-xs text-muted-foreground",
                isPast && "line-through",
              )}
            >
              <Clock className="size-3" aria-hidden />
              {timeStr}
            </span>

            {/* ✅ Botão editar */}
            {canEdit && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                aria-label="Editar evento"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="size-3.5" aria-hidden />
              </Button>
            )}

            {canDelete && (
              <DeleteAgendaEventButton
                eventId={event.id}
                organizationSlug={organizationSlug}
              />
            )}
          </div>
        </header>

        {/* Conductor */}
        {event.conductor && (
          <div
            className={cn("flex items-center gap-2", isPast && "line-through")}
          >
            {event.conductor.image ? (
              <Image
                src={event.conductor.image}
                alt={event.conductor.name}
                width={24}
                height={24}
                className={cn(
                  "rounded-full size-6 object-cover",
                  isPast && "grayscale",
                )}
              />
            ) : (
              <span className="size-6 rounded-full bg-muted flex items-center justify-center">
                <User className="size-3.5 text-muted-foreground" aria-hidden />
              </span>
            )}
            <span className="text-sm">
              <span className="text-muted-foreground">Conductor: </span>
              <span className="font-medium">{event.conductor.name}</span>
            </span>
          </div>
        )}

        {/* Saída / Tipo / Territorio */}
        {(event.saida || event.tipo || event.territorio) && (
          <div className={cn("flex flex-wrap gap-2", isPast && "opacity-60")}>
            {event.saida && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                📍 {event.saida}
              </span>
            )}
            {event.tipo && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                🏷️ {event.tipo}
              </span>
            )}
            {event.territorio && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                🗺️ {event.territorio}
              </span>
            )}
          </div>
        )}

        {/* Info */}
        {event.info && (
          <p
            className={cn(
              "text-sm text-muted-foreground flex items-start gap-1.5",
              isPast && "line-through",
            )}
          >
            <Info className="size-3.5 mt-0.5 shrink-0" aria-hidden />
            {event.info}
          </p>
        )}
      </article>

      {/* ✅ Modal de edição */}
      {canEdit && (
        <EditAgendaEventModal
          event={event}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          organizationSlug={organizationSlug}
          members={members}
        />
      )}
    </>
  );
}
