"use client";

import { useState, useCallback } from "react";
import { AgendaCalendar } from "./AgendaCalendat";
import { AgendaEventList } from "./AgendaEventList";
import type { AgendaEventItem } from "../types/agenda.types";
import { AgendaNoEventModal } from "./ui/AgendaNoEventModal";

const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const WEEK_DAYS_ES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

interface Props {
  events: AgendaEventItem[];
  year: number;
  month: number;
  monthLabel: string;
  organizationSlug: string;
  canDelete?: boolean;
  canEdit?: boolean;
}

export function AgendaPageClient({
  events,
  year,
  month,
  monthLabel,
  organizationSlug,
  canDelete,
  canEdit,
}: Props) {
  const [highlightEventId, setHighlightEventId] = useState<string | null>(null);
  const [noEventDate, setNoEventDate] = useState<string | null>(null);

  const handleDayClick = useCallback(
    (day: number) => {
      // Encontra evento nesse dia
      const match = events.find((e) => {
        const d = new Date(e.date);
        return (
          d.getFullYear() === year &&
          d.getMonth() === month &&
          d.getDate() === day
        );
      });

      if (match) {
        setHighlightEventId(match.id);
        // Scroll para a seção de eventos
        document
          .getElementById(`event-${match.id}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        const d = new Date(year, month, day);
        const label = `${WEEK_DAYS_ES[d.getDay()]} ${day} de ${MONTHS_ES[month]}`;
        setNoEventDate(label);
      }
    },
    [events, year, month],
  );

  return (
    <>
      <AgendaCalendar
        events={events}
        year={year}
        month={month}
        onDayClick={handleDayClick}
      />

      <AgendaEventList
        events={events}
        monthLabel={monthLabel}
        organizationSlug={organizationSlug}
        canDelete={canDelete}
        canEdit={canEdit}
        highlightEventId={highlightEventId}
        onHighlightConsumed={() => setHighlightEventId(null)}
      />

      <AgendaNoEventModal
        open={!!noEventDate}
        dateLabel={noEventDate ?? ""}
        onClose={() => setNoEventDate(null)}
      />
    </>
  );
}
