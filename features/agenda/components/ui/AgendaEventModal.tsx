"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { Clock, Info, MapPin, Tag, User } from "lucide-react";
import Image from "next/image";
import type { AgendaEventItem } from "../../types/agenda.types";
import { eventTime, isEventPast } from "../../utils/agenda-time";
import { dateLabelLong } from "../../utils/calendar-locale";

interface Props {
  event: AgendaEventItem | null;
  onClose: () => void;
}

export function AgendaEventModal({ event, onClose }: Props) {
  const { t, locale } = useI18n();
  if (!event) return null;

  const isPast = isEventPast(event);

  const dateStr = dateLabelLong(locale, event.date);
  const timeStr = eventTime(event);

  return (
    <Dialog
      open={!!event}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base capitalize leading-snug">{dateStr}</DialogTitle>
          <DialogDescription className="flex items-center gap-1.5 text-sm">
            <Clock className="size-3.5" aria-hidden />
            {timeStr}
            {t.agenda.hourSuffix}
            {isPast && (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {t.agenda.pastBadge}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-1">
          {event.conductor && (
            <div className="flex items-center gap-2.5">
              {event.conductor?.user?.image ? (
                <Image
                  src={event.conductor.user.image}
                  alt={event.conductor.name}
                  width={32}
                  height={32}
                  className={cn("size-8 rounded-full object-cover", isPast && "grayscale")}
                />
              ) : (
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <User className="size-4 text-muted-foreground" aria-hidden />
                </span>
              )}
              <div>
                <p className="text-xs text-muted-foreground">{t.agenda.conductor}</p>
                <p className="text-sm font-medium">{event.conductor.name}</p>
              </div>
            </div>
          )}

          {(event.saida || event.tipo || event.territorio) && (
            <div className="flex flex-wrap gap-2">
              {event.saida && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  <MapPin className="size-3 text-primary" aria-hidden />
                  {t.agenda.exit}: {event.saida}
                </span>
              )}
              {event.tipo && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  <Tag className="size-3 text-primary" aria-hidden />
                  {t.agenda.type}: {event.tipo}
                </span>
              )}
              {event.territorio && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  <MapPin className="size-3 text-primary" aria-hidden />
                  {t.agenda.territory}: {event.territorio}
                </span>
              )}
            </div>
          )}

          {event.info && (
            <p className="flex items-start gap-1.5 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <span className="font-medium">{t.agenda.infoLabel}:</span> {event.info}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
