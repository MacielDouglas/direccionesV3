"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { CalendarX, ChevronDown, ChevronUp } from "lucide-react";
import type { AgendaEventItem as TAgendaEventItem } from "../types/agenda.types";
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
  // ✅ id do evento que o calendário quer destacar
  highlightEventId?: string | null;
  onHighlightConsumed?: () => void;
}

export function AgendaEventList({
  events,
  monthLabel,
  organizationSlug,
  canDelete,
  canEdit,
  members,
  highlightEventId,
  onHighlightConsumed,
}: Props) {
  const now = new Date();
  const [pastExpanded, setPastExpanded] = useState(false);
  const [modalEvent, setModalEvent] = useState<TAgendaEventItem | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Separa passados dos futuros/hoje
  const pastEvents = events
    .filter((e) => new Date(e.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // mais recente primeiro

  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // ── Scroll + destaque quando calendário seleciona dia ──────────────────
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

  const renderEvent = useCallback(
    (event: TAgendaEventItem) => (
      <li key={event.id} id={`event-${event.id}`}>
        <button
          type="button"
          className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl
            [&[data-highlight]>article]:ring-2 [&[data-highlight]>article]:ring-primary [&[data-highlight]>article]:ring-offset-2"
          onClick={() => setModalEvent(event)}
          aria-label={`Ver detalles del evento`}
        >
          <AgendaEventItem
            event={event}
            organizationSlug={organizationSlug}
            canDelete={canDelete}
            canEdit={canEdit}
            members={members}
          />
        </button>
      </li>
    ),
    [organizationSlug, canDelete, canEdit, members],
  );

  if (events.length === 0) {
    return (
      <section aria-labelledby="events-heading">
        <h2 id="events-heading" className="text-base font-semibold mb-3">
          Eventos — {monthLabel}
        </h2>
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground rounded-xl border bg-muted/30">
          <CalendarX className="size-8" aria-hidden />
          <p className="text-sm">Sin información para este mes.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section aria-labelledby="events-heading">
        <h2 id="events-heading" className="text-base font-semibold mb-3">
          Eventos — {monthLabel}
        </h2>

        <ul
          ref={listRef}
          className="flex flex-col gap-3"
          aria-label="Lista de eventos"
        >
          {/* ── Eventos passados colapsados ──────────────────────────────── */}
          {pastEvents.length > 0 && (
            <li>
              <button
                type="button"
                onClick={() => setPastExpanded((v) => !v)}
                aria-expanded={pastExpanded}
                className="w-full flex items-center justify-between gap-2 rounded-xl border bg-muted/30 px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span>
                  {pastEvents.length} evento{pastEvents.length !== 1 ? "s" : ""}{" "}
                  anterior{pastEvents.length !== 1 ? "es" : ""}
                </span>
                {pastExpanded ? (
                  <ChevronUp className="size-4 shrink-0" aria-hidden />
                ) : (
                  <ChevronDown className="size-4 shrink-0" aria-hidden />
                )}
              </button>

              {/* Chips dos passados quando colapsado */}
              {!pastExpanded && (
                <div className="flex flex-wrap gap-2 mt-2 px-1">
                  {pastEvents.map((e) => {
                    const d = new Date(e.date);
                    const label = d.toLocaleDateString("es-419", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    });
                    const time =
                      e.time ??
                      d.toLocaleTimeString("es-419", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      });
                    return (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => setModalEvent(e)}
                        className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring capitalize"
                        aria-label={`Ver evento pasado: ${label}`}
                      >
                        <span className="font-medium">{label}</span>
                        <span className="opacity-60">{time}hs</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Lista expandida dos passados */}
              {pastExpanded && (
                <ul className="flex flex-col gap-3 mt-3">
                  {pastEvents.map(renderEvent)}
                </ul>
              )}
            </li>
          )}

          {/* ── Eventos futuros / hoje ───────────────────────────────────── */}
          {upcomingEvents.length === 0 ? (
            <li>
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground rounded-xl border bg-muted/20">
                <CalendarX className="size-6" aria-hidden />
                <p className="text-sm">No hay eventos próximos este mes.</p>
              </div>
            </li>
          ) : (
            upcomingEvents.map(renderEvent)
          )}
        </ul>
      </section>

      {/* Modal de detalhes do evento */}
      <AgendaEventModal
        event={modalEvent}
        onClose={() => setModalEvent(null)}
      />
    </>
  );
}
