"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { useCallback, useState } from "react";
import type { AgendaEventItem, AgendaFieldOptions, AgendaMember } from "../types/agenda.types";
import { eventDateParts } from "../utils/agenda-time";
import { monthName, weekdayLong } from "../utils/calendar-locale";
import { AgendaCalendar } from "./AgendaCalendar";
import { AgendaEventList } from "./AgendaEventList";
import { AgendaHero } from "./AgendaHero";
import { AgendaNoEventModal } from "./ui/AgendaNoEventModal";

interface Props {
  events: AgendaEventItem[];
  year: number;
  month: number;
  monthLabel: string;
  organizationSlug: string;
  canDelete?: boolean;
  canEdit?: boolean;
  members?: AgendaMember[];
  fieldOptions?: AgendaFieldOptions | null;
  adminContent?: React.ReactNode;
  footerContent?: React.ReactNode;
}

export function AgendaPageClient({
  events,
  year,
  month,
  monthLabel,
  organizationSlug,
  canDelete,
  canEdit,
  members,
  fieldOptions,
  adminContent,
  footerContent,
}: Props) {
  const { locale } = useI18n();
  const [highlightEventId, setHighlightEventId] = useState<string | null>(null);
  const [noEventDate, setNoEventDate] = useState<string | null>(null);

  const handleDayClick = useCallback(
    (day: number) => {
      const match = events.find((e) => {
        const { year: ey, month: em, day: ed } = eventDateParts(e.date);
        return ey === year && em === month && ed === day;
      });

      if (match) {
        setHighlightEventId(match.id);
        document
          .getElementById(`event-${match.id}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        const d = new Date(Date.UTC(year, month, day));
        const label = `${weekdayLong(locale, d.getUTCDay())} ${day} de ${monthName(locale, month)}`;
        setNoEventDate(label);
      }
    },
    [events, year, month, locale],
  );

  return (
    <div className="flex flex-col gap-6">
      <AgendaHero events={events} monthLabel={monthLabel} />

      <AgendaCalendar events={events} year={year} month={month} onDayClick={handleDayClick} />

      {adminContent}

      <AgendaEventList
        events={events}
        monthLabel={monthLabel}
        organizationSlug={organizationSlug}
        canDelete={canDelete}
        canEdit={canEdit}
        members={members}
        fieldOptions={fieldOptions}
        highlightEventId={highlightEventId}
        onHighlightConsumed={() => setHighlightEventId(null)}
      />

      {footerContent}

      <AgendaNoEventModal
        open={!!noEventDate}
        dateLabel={noEventDate ?? ""}
        onClose={() => setNoEventDate(null)}
      />
    </div>
  );
}
