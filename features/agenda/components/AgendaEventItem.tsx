"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { Clock, Info, MapPin, MapPinned, Pencil, Tag, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type {
  AgendaFieldOptions,
  AgendaMember,
  AgendaEventItem as TAgendaEventItem,
} from "../types/agenda.types";
import { eventDateParts, eventStartUtcMs, eventTime, isEventPast } from "../utils/agenda-time";
import { monthName, weekdayLong } from "../utils/calendar-locale";
import { EditAgendaEventModal } from "./EditAgendaEventModal";
import { DeleteAgendaEventButton } from "./ui/DeleteAgendaEventButton";

interface Props {
  event: TAgendaEventItem;
  organizationSlug: string;
  canDelete?: boolean;
  canEdit?: boolean;
  members?: AgendaMember[];
  fieldOptions?: AgendaFieldOptions | null;
  onOpen?: () => void;
}

export function AgendaEventItem({
  event,
  organizationSlug,
  canDelete,
  canEdit,
  members = [],
  fieldOptions,
  onOpen,
}: Props) {
  const { t, locale } = useI18n();
  const [editOpen, setEditOpen] = useState(false);

  const isPast = isEventPast(event);
  const { day, month } = eventDateParts(event.date);
  const timeStr = eventTime(event);
  const dateStr = `${weekdayLong(locale, event.date.getUTCDay())}, ${day} de ${monthName(locale, month)}`;

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
          "group-data-[highlight]:ring-2 group-data-[highlight]:ring-primary group-data-[highlight]:ring-offset-2 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs transition-[filter,opacity]",
          isPast && "blur-[2px] opacity-80",
          onOpen && "cursor-pointer",
        )}
        aria-label={`${dateStr}, ${timeStr}`}
      >
        <div className="flex items-start gap-3">
          <div className="flex min-w-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
            <span className="text-2xl font-bold leading-none tabular-nums text-primary">{day}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {monthName(locale, month).slice(0, 3)}
            </span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <time
              dateTime={new Date(eventStartUtcMs(event)).toISOString()}
              className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground"
            >
              <Clock className="size-3.5" aria-hidden />
              {timeStr}
              {t.agenda.hourSuffix}
            </time>

            <p className="text-sm capitalize text-muted-foreground">{dateStr}</p>
          </div>

          {(canEdit || canDelete) && (
            <div className="flex shrink-0 items-center gap-1">
              {canEdit && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-11 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  aria-label={t.agenda.editEvent}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditOpen(true);
                  }}
                >
                  <Pencil className="size-4" aria-hidden />
                </Button>
              )}

              {canDelete && (
                <DeleteAgendaEventButton eventId={event.id} organizationSlug={organizationSlug} />
              )}
            </div>
          )}
        </div>

        {event.conductor && (
          <div className="flex items-center gap-2">
            {event.conductor?.user?.image ? (
              <Image
                src={event.conductor.user.image}
                alt={event.conductor.name}
                width={28}
                height={28}
                className="size-7 rounded-full object-cover"
              />
            ) : (
              <span className="flex size-7 items-center justify-center rounded-full bg-muted">
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
          <div className="flex flex-col gap-1.5">
            {event.saida && (
              <p className="flex items-center gap-1.5 text-sm">
                <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
                <span className="text-muted-foreground">{t.agenda.exit}:</span>{" "}
                <span className="font-medium">{event.saida}</span>
              </p>
            )}
            {event.tipo && (
              <p className="flex items-center gap-1.5 text-sm">
                <Tag className="size-4 shrink-0 text-primary" aria-hidden />
                <span className="text-muted-foreground">{t.agenda.type}:</span>{" "}
                <span className="font-medium">{event.tipo}</span>
              </p>
            )}
            {event.territorio && (
              <p className="flex items-center gap-1.5 text-sm">
                <MapPinned className="size-4 shrink-0 text-primary" aria-hidden />
                <span className="text-muted-foreground">{t.agenda.territory}:</span>{" "}
                <span className="font-medium">{event.territorio}</span>
              </p>
            )}
          </div>
        )}

        {event.info && (
          <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
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
          fieldOptions={fieldOptions}
        />
      )}
    </>
  );
}
