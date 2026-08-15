"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { CalendarDays } from "lucide-react";
import type { AgendaEventItem } from "../types/agenda.types";
import { eventDateParts, eventStartUtcMs, eventTime } from "../utils/agenda-time";
import { monthName, weekdayLong } from "../utils/calendar-locale";

interface Props {
  events: AgendaEventItem[];
  monthLabel: string;
}

function nextEventLabel(locale: "pt" | "es", events: AgendaEventItem[]): string | null {
  const now = Date.now();
  const upcoming = events
    .filter((e) => eventStartUtcMs(e) > now)
    .sort((a, b) => eventStartUtcMs(a) - eventStartUtcMs(b));
  if (upcoming.length === 0) return null;

  const next = upcoming[0];
  const { year, month, day } = eventDateParts(next.date);
  const weekday = new Date(Date.UTC(year, month, day)).getUTCDay();
  const dateStr = `${weekdayLong(locale, weekday)}, ${day} de ${monthName(locale, month)}`;
  const time = eventTime(next);
  return `${dateStr}${time ? ` · ${time}` : ""}`;
}

export function AgendaHero({ events, monthLabel }: Props) {
  const { t, locale } = useI18n();
  const nextLabel = nextEventLabel(locale, events);

  return (
    <div className="rounded-2xl bg-black p-6 text-white shadow-xs shadow-black/20">
      <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-neutral-400">
        <CalendarDays className="size-4" aria-hidden />
        {monthLabel}
      </span>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-5xl font-bold leading-none tracking-tight tabular-nums">
          {events.length}
        </span>
        <span className="text-sm font-medium text-neutral-300">
          {events.length === 1
            ? t.agenda.heroEventsOne.replace("{count}", "1")
            : t.agenda.heroEventsMany.replace("{count}", String(events.length))}
        </span>
      </div>
      <p className="mt-2 text-xs text-neutral-400">
        {nextLabel ? `${t.agenda.heroNext}: ${nextLabel}` : t.agenda.heroNoNext}
      </p>
    </div>
  );
}
