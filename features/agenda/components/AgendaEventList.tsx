import { CalendarX } from "lucide-react";
import type { AgendaEventItem as TAgendaEventItem } from "../types/agenda.types";
import { AgendaEventItem } from "./AgendaEventItem";

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
}

export function AgendaEventList({
  events,
  monthLabel,
  organizationSlug,
  canDelete,
  canEdit,
  members,
}: Props) {
  return (
    <section aria-labelledby="events-heading">
      <h2 id="events-heading" className="text-base font-semibold mb-3">
        Eventos — {monthLabel}
      </h2>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground rounded-xl border bg-muted/30">
          <CalendarX className="size-8" aria-hidden />
          <p className="text-sm">Sin información para este mes.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3" aria-label="Lista de eventos">
          {events.map((event) => (
            <li key={event.id}>
              <AgendaEventItem
                event={event}
                organizationSlug={organizationSlug}
                canDelete={canDelete}
                canEdit={canEdit}
                members={members}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
