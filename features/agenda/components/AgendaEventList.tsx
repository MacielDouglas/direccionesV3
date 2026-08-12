"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { CalendarX, ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AgendaEventItem as TAgendaEventItem } from "../types/agenda.types";
import { eventStartUtcMs, eventTime, isEventPast } from "../utils/agenda-time";
import { eventDateShort } from "../utils/calendar-locale";
import { AgendaEventItem } from "./AgendaEventItem";
import { AgendaEventModal } from "./ui/AgendaEventModal";

interface Member {
  user: { id: string; name: string; image: string | null };
}

interface Props {
  events: TAgendaEventItem[];
  monthLabel: string;
  organizationSlug: string;
  canDelete?: boolean;
  canEdit?: boolean;
  members?: Member[];
  highlightEventId?: string | null;
  onHighlightConsumed?: () => void;
}

export function AgendaEventList({
  events,
  monthLabel: monthLabelProp,
  organizationSlug,
  canDelete,
  canEdit,
  members,
  highlightEventId,
  onHighlightConsumed,
}: Props) {
  const { t, locale } = useI18n();
  const [pastExpanded, setPastExpanded] = useState(false);
  const [modalEvent, setModalEvent] = useState<TAgendaEventItem | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const pastEvents = events
    .filter((e) => isEventPast(e))
    .sort((a, b) => eventStartUtcMs(b) - eventStartUtcMs(a));

  const upcomingEvents = events
    .filter((e) => !isEventPast(e))
    .sort((a, b) => eventStartUtcMs(a) - eventStartUtcMs(b));

  useEffect(() => {
    if (!highlightEventId) return;

    const el = document.getElementById(`event-${highlightEventId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.setAttribute("data-highlight", "true");
      const timer = setTimeout(() => {
        el.removeAttribute("data-highlight");
        onHighlightConsumed?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
    onHighlightConsumed?.();
  }, [highlightEventId, onHighlightConsumed]);

  useEffect(() => {
    if (!modalEvent) return;
    const updated = events.find((e) => e.id === modalEvent.id);
    if (updated && updated !== modalEvent) setModalEvent(updated);
  }, [events, modalEvent]);

  const renderEvent = useCallback(
    (event: TAgendaEventItem) => (
      <li key={event.id} id={`event-${event.id}`} className="group">
        <AgendaEventItem
          event={event}
          organizationSlug={organizationSlug}
          canDelete={canDelete}
          canEdit={canEdit}
          members={members}
          onOpen={() => setModalEvent(event)}
        />
      </li>
    ),
    [organizationSlug, canDelete, canEdit, members],
  );

  if (events.length === 0) {
    return (
      <section aria-labelledby="events-heading">
        <h2 id="events-heading" className="mb-3 text-base font-semibold">
          {t.agenda.eventsSection.replace("{month}", monthLabelProp)}
        </h2>
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 py-10 text-muted-foreground">
          <CalendarX className="size-8" aria-hidden />
          <p className="text-sm">{t.agenda.noEvents}</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section aria-labelledby="events-heading">
        <h2 id="events-heading" className="mb-3 text-base font-semibold">
          {t.agenda.eventsSection.replace("{month}", monthLabelProp)}
        </h2>

        <ul
          ref={listRef}
          className="flex flex-col gap-3"
          aria-label={t.agenda.eventsSection.replace("{month}", monthLabelProp)}
        >
          {pastEvents.length > 0 && (
            <li>
              <button
                type="button"
                onClick={() => setPastExpanded((v) => !v)}
                aria-expanded={pastExpanded}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span>
                  {pastEvents.length === 1
                    ? t.agenda.pastCountOne.replace("{count}", "1")
                    : t.agenda.pastCountMany.replace("{count}", String(pastEvents.length))}
                </span>
                {pastExpanded ? (
                  <ChevronUp className="size-4 shrink-0" aria-hidden />
                ) : (
                  <ChevronDown className="size-4 shrink-0" aria-hidden />
                )}
              </button>

              {!pastExpanded && (
                <div className="mt-2 flex flex-wrap gap-2 px-1">
                  {pastEvents.map((e) => {
                    const label = eventDateShort(locale, e.date);
                    const time = eventTime(e);
                    return (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => setModalEvent(e)}
                        className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs capitalize text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={t.agenda.viewEvent}
                      >
                        <span className="font-medium">{label}</span>
                        <span className="opacity-60">{time}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {pastExpanded && (
                <ul className="mt-3 flex flex-col gap-3">{pastEvents.map(renderEvent)}</ul>
              )}
            </li>
          )}

          {upcomingEvents.length === 0 ? (
            <li>
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-muted/20 py-8 text-muted-foreground">
                <CalendarX className="size-6" aria-hidden />
                <p className="text-sm">{t.agenda.noUpcomingEvents}</p>
              </div>
            </li>
          ) : (
            upcomingEvents.map(renderEvent)
          )}
        </ul>
      </section>

      <AgendaEventModal event={modalEvent} onClose={() => setModalEvent(null)} />
    </>
  );
}
