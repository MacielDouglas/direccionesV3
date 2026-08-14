"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { CalendarX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AgendaFieldOptions,
  AgendaMember,
  AgendaEventItem as TAgendaEventItem,
} from "../types/agenda.types";
import { eventStartUtcMs, isEventPast } from "../utils/agenda-time";
import { AgendaEventItem } from "./AgendaEventItem";
import { AgendaEventModal } from "./ui/AgendaEventModal";

interface Props {
  events: TAgendaEventItem[];
  monthLabel: string;
  organizationSlug: string;
  canDelete?: boolean;
  canEdit?: boolean;
  dimPast?: boolean;
  members?: AgendaMember[];
  fieldOptions?: AgendaFieldOptions | null;
  highlightEventId?: string | null;
  onHighlightConsumed?: () => void;
}

export function AgendaEventList({
  events,
  monthLabel: monthLabelProp,
  organizationSlug,
  canDelete,
  canEdit,
  dimPast,
  members,
  fieldOptions,
  highlightEventId,
  onHighlightConsumed,
}: Props) {
  const { t } = useI18n();
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
          dimPast={dimPast}
          members={members}
          fieldOptions={fieldOptions}
          onOpen={() => setModalEvent(event)}
        />
      </li>
    ),
    [organizationSlug, canDelete, canEdit, dimPast, members, fieldOptions],
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
          {upcomingEvents.length === 0 && pastEvents.length > 0 && (
            <li>
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-muted/20 py-8 text-muted-foreground">
                <CalendarX className="size-6" aria-hidden />
                <p className="text-sm">{t.agenda.noUpcomingEvents}</p>
              </div>
            </li>
          )}

          {upcomingEvents.map(renderEvent)}

          {pastEvents.length > 0 && (
            <li className="mt-2 flex flex-col gap-3" aria-label={t.agenda.pastEvents}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t.agenda.pastEvents}
              </h3>
              <ul className="flex flex-col gap-3">{pastEvents.map(renderEvent)}</ul>
            </li>
          )}
        </ul>
      </section>

      <AgendaEventModal event={modalEvent} onClose={() => setModalEvent(null)} />
    </>
  );
}
