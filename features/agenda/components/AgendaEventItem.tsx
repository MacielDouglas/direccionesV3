"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { Clock, Info, MapPin, Pencil, Tag, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { AgendaEventItem as TAgendaEventItem } from "../types/agenda.types";
import { eventStartUtcMs, eventTime, isEventPast } from "../utils/agenda-time";
import { dateLabelLong } from "../utils/calendar-locale";
import { EditAgendaEventModal } from "./EditAgendaEventModal";
import { DeleteAgendaEventButton } from "./ui/DeleteAgendaEventButton";

interface Member {
  user: { id: string; name: string; image: string | null };
}

interface Props {
  event: TAgendaEventItem;
  organizationSlug: string;
  canDelete?: boolean;
  canEdit?: boolean;
  members?: Member[];
  onOpen?: () => void;
}

export function AgendaEventItem({
  event,
  organizationSlug,
  canDelete,
  canEdit,
  members = [],
  onOpen,
}: Props) {
  const { t, locale } = useI18n();
  const [editOpen, setEditOpen] = useState(false);

  const isPast = isEventPast(event);

  const dateStr = dateLabelLong(locale, event.date);

  const timeStr = eventTime(event);

  return (
    <>
      <article
        onClick={onOpen}
        onKeyDown={(e) => {
          if (!onOpen) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
        className={cn(
          "group-data-[highlight]:ring-2 group-data-[highlight]:ring-primary group-data-[highlight]:ring-offset-2 flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 shadow-xs transition-opacity",
          isPast && "opacity-50",
          onOpen && "cursor-pointer",
        )}
        aria-label={isPast ? `${t.agenda.pastBadge}: ${dateStr}` : `${t.agenda.title}: ${dateStr}`}
      >
        <header className="flex items-start justify-between gap-2">
          <time
            dateTime={new Date(eventStartUtcMs(event)).toISOString()}
            className={cn(
              "text-sm font-semibold capitalize text-foreground",
              isPast && "line-through",
            )}
          >
            {dateStr}
          </time>

          <div className="flex shrink-0 items-center gap-1">
            <span
              className={cn(
                "flex items-center gap-1 text-xs text-muted-foreground",
                isPast && "line-through",
              )}
            >
              <Clock className="size-3" aria-hidden />
              {timeStr}
            </span>

            {canEdit && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-7 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                aria-label={t.agenda.editEvent}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditOpen(true);
                }}
              >
                <Pencil className="size-3.5" aria-hidden />
              </Button>
            )}

            {canDelete && (
              <DeleteAgendaEventButton eventId={event.id} organizationSlug={organizationSlug} />
            )}
          </div>
        </header>

        {event.conductor && (
          <div className={cn("flex items-center gap-2", isPast && "line-through")}>
            {event.conductor.image ? (
              <Image
                src={event.conductor.image}
                alt={event.conductor.name}
                width={24}
                height={24}
                className={cn("size-6 rounded-full object-cover", isPast && "grayscale")}
              />
            ) : (
              <span className="flex size-6 items-center justify-center rounded-full bg-muted">
                <User className="size-3.5 text-muted-foreground" aria-hidden />
              </span>
            )}
            <span className="text-sm">
              <span className="text-muted-foreground">{t.agenda.conductor}: </span>
              <span className="font-medium">{event.conductor.name}</span>
            </span>
          </div>
        )}

        {(event.saida || event.tipo || event.territorio) && (
          <div className={cn("flex flex-wrap gap-2", isPast && "opacity-60")}>
            {event.saida && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground">
                <MapPin className="size-3 shrink-0 text-primary" aria-hidden />
                <span className="font-light text-muted-foreground">{t.agenda.exit}:</span>{" "}
                {event.saida}
              </span>
            )}
            {event.tipo && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground">
                <Tag className="size-3 shrink-0 text-primary" aria-hidden />
                {t.agenda.type}: {event.tipo}
              </span>
            )}
            {event.territorio && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground">
                <MapPin className="size-3 shrink-0 text-primary" aria-hidden />
                {t.agenda.territory}: {event.territorio}
              </span>
            )}
          </div>
        )}

        {event.info && (
          <p
            className={cn(
              "flex items-start gap-1.5 text-sm text-muted-foreground",
              isPast && "line-through",
            )}
          >
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            {event.info}
          </p>
        )}
      </article>

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
