"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import type { AgendaEventItem } from "../types/agenda.types";
import { brasiliaNow, eventDateParts } from "../utils/agenda-time";
import { monthLabel, monthName, weekdayLong, weekdayShort } from "../utils/calendar-locale";

interface Props {
  events: AgendaEventItem[];
  year: number;
  month: number;
  onDayClick?: (day: number) => void;
}

export function AgendaCalendar({ events, year, month, onDayClick }: Props) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const today = brasiliaNow();
  const [isPending, startTransition] = useTransition();

  const navigate = (dir: -1 | 1) => {
    const d = new Date(year, month + dir, 1);
    const params = new URLSearchParams({
      year: String(d.getFullYear()),
      month: String(d.getMonth()),
    });
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const eventDays = useMemo(() => {
    return new Set(
      events.map((e) => {
        const { year: ey, month: em, day: ed } = eventDateParts(e.date);
        return `${ey}-${em}-${ed}`;
      }),
    );
  }, [events]);

  const { firstDay, daysInMonth } = useMemo(
    () => ({
      firstDay: new Date(Date.UTC(year, month, 1)).getUTCDay(),
      daysInMonth: new Date(Date.UTC(year, month + 1, 0)).getUTCDate(),
    }),
    [year, month],
  );

  const isToday = (day: number) =>
    day === today.getUTCDate() && month === today.getUTCMonth() && year === today.getUTCFullYear();

  const hasEvent = (day: number) => eventDays.has(`${year}-${month}-${day}`);
  const isCurrentMonth = year === today.getUTCFullYear() && month === today.getUTCMonth();

  const weeks = useMemo(() => {
    const cells: Array<{ day: number | null; key: string }> = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, key: `pad-${i}` });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, key: `day-${d}` });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ day: null, key: `pad-end-${cells.length}` });
    }

    const rows: Array<Array<{ day: number | null; key: string }>> = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [firstDay, daysInMonth]);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          disabled={isPending}
          aria-label={t.agenda.previousMonth}
          className="rounded-full p-3 text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>

        <div className="text-center">
          <h2 className="flex items-center justify-center gap-2 text-base font-semibold tracking-tight">
            {isPending && (
              <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
            )}
            {monthLabel(locale, month, year)}
          </h2>
          {isCurrentMonth && !isPending && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t.agenda.todayHint
                .replace("{weekday}", weekdayLong(locale, today.getUTCDay()))
                .replace("{day}", String(today.getUTCDate()))
                .replace("{month}", monthName(locale, today.getUTCMonth()))
                .replace("{year}", String(year))}
            </p>
          )}
          {isPending && (
            <p className="mt-0.5 animate-pulse text-xs text-muted-foreground">{t.agenda.loading}</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate(1)}
          disabled={isPending}
          aria-label={t.agenda.nextMonth}
          className="rounded-full p-3 text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>
      </div>

      <div
        className={cn(
          "transition-opacity duration-200",
          isPending && "pointer-events-none opacity-40",
        )}
      >
        <table
          aria-label={monthLabel(locale, month, year)}
          aria-busy={isPending}
          className="w-full border-collapse"
        >
          <thead>
            <tr>
              {Array.from({ length: 7 }, (_, i) => i).map((d) => (
                <th
                  key={d}
                  scope="col"
                  className="py-1 text-center text-xs font-semibold text-muted-foreground"
                >
                  {weekdayShort(locale, d)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={week[0].key}>
                {week.map((cell) => {
                  if (cell.day === null) {
                    return <td key={cell.key} aria-hidden />;
                  }

                  const day = cell.day;
                  const todayDay = isToday(day);
                  const eventDay = hasEvent(day);
                  const isClickable = !!onDayClick;

                  return (
                    <td key={cell.key} className="py-0.5 text-center">
                      <button
                        type="button"
                        disabled={!isClickable || isPending}
                        onClick={() => onDayClick?.(day)}
                        aria-label={t.agenda[eventDay ? "dayHasEvents" : "dayNoEvents"]
                          .replace("{day}", String(day))
                          .replace("{month}", monthName(locale, month))}
                        className={cn(
                          "flex size-10 items-center justify-center rounded-full text-sm font-medium transition-all",
                          isClickable && !isPending && "cursor-pointer",
                          isClickable &&
                            !isPending &&
                            eventDay &&
                            "hover:ring-2 hover:ring-primary hover:ring-offset-1",
                          isClickable && !isPending && !eventDay && "hover:bg-muted",
                          todayDay && "bg-brand font-bold text-brand-foreground",
                          !todayDay && eventDay && "bg-primary/10 font-semibold text-primary",
                          !todayDay && !eventDay && "text-muted-foreground",
                          (!isClickable || isPending) && "cursor-default",
                        )}
                      >
                        {day}
                      </button>
                      {eventDay && (
                        <span
                          className={cn(
                            "mt-0.5 block size-1.5 rounded-full",
                            todayDay ? "bg-brand-foreground/50" : "bg-primary",
                          )}
                          aria-hidden
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="inline-block size-3 rounded-full bg-primary" aria-hidden />
          {t.agenda.eventLegend}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="inline-block size-3 rounded-full bg-brand" aria-hidden />
          {t.agenda.todayLegend}
        </span>
      </div>
    </div>
  );
}
