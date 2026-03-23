"use client";

import { useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgendaEventItem } from "../types/agenda.types";

const WEEK_DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
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

interface Props {
  events: AgendaEventItem[];
  year: number;
  month: number;
  onDayClick?: (day: number) => void; // ✅ novo
}

export function AgendaCalendar({ events, year, month, onDayClick }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const today = new Date();

  const navigate = (dir: -1 | 1) => {
    const d = new Date(year, month + dir, 1);
    const params = new URLSearchParams({
      year: String(d.getFullYear()),
      month: String(d.getMonth()),
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const eventDays = useMemo(() => {
    return new Set(
      events.map((e) => {
        const d = new Date(e.date);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      }),
    );
  }, [events]);

  const { firstDay, daysInMonth } = useMemo(
    () => ({
      firstDay: new Date(year, month, 1).getDay(),
      daysInMonth: new Date(year, month + 1, 0).getDate(),
    }),
    [year, month],
  );

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const hasEvent = (day: number) => eventDays.has(`${year}-${month}-${day}`);
  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      {/* Header nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Mes anterior"
          className="rounded-full p-2 hover:bg-muted transition-colors"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>

        <div className="text-center">
          <h2 className="text-lg font-bold">
            {MONTHS_ES[month]} {year}
          </h2>
          {isCurrentMonth && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Hoy es {WEEK_DAYS[today.getDay()]}, {today.getDate()} de{" "}
              {MONTHS_ES[today.getMonth()]} de {year}.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate(1)}
          aria-label="Próximo mes"
          className="rounded-full p-2 hover:bg-muted transition-colors"
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>
      </div>

      {/* Cabeçalho dias da semana */}
      <div role="row" className="grid grid-cols-7 mb-2">
        {WEEK_DAYS.map((d) => (
          <div
            key={d}
            role="columnheader"
            className="text-center text-xs font-semibold text-muted-foreground py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid de dias */}
      <div
        role="grid"
        aria-label={`${MONTHS_ES[month]} ${year}`}
        className="grid grid-cols-7 gap-y-1"
      >
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e-${i}`} role="gridcell" aria-hidden />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const todayDay = isToday(day);
          const eventDay = hasEvent(day);
          const isClickable = !!onDayClick; // ✅ clicável se callback fornecido

          return (
            <div
              key={day}
              role="gridcell"
              className="flex flex-col items-center justify-center py-0.5"
            >
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => onDayClick?.(day)}
                aria-label={`${day} de ${MONTHS_ES[month]}${todayDay ? ", hoy" : ""}${eventDay ? ", tiene eventos" : ", sin eventos"}`}
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-sm font-medium transition-all",
                  // ✅ cursor e hover apenas se clicável
                  isClickable && "cursor-pointer",
                  isClickable &&
                    eventDay &&
                    "hover:ring-2 hover:ring-primary hover:ring-offset-1",
                  isClickable && !eventDay && "hover:bg-muted",
                  // cores
                  todayDay && "bg-[#bfd142] text-black font-bold",
                  !todayDay &&
                    eventDay &&
                    "bg-primary/10 text-primary font-semibold",
                  !todayDay && !eventDay && "text-muted-foreground",
                  !isClickable && "cursor-default",
                )}
              >
                {day}
              </button>
              {eventDay && (
                <span
                  className={cn(
                    "mt-0.5 size-1.5 rounded-full",
                    todayDay ? "bg-black/40" : "bg-primary",
                  )}
                  aria-hidden
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className="size-3 rounded-full bg-primary inline-block"
            aria-hidden
          />
          Evento
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className="size-3 rounded-full bg-[#bfd142] inline-block"
            aria-hidden
          />
          Hoy
        </span>
      </div>
    </div>
  );
}
