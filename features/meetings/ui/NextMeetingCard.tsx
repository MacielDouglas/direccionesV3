import { getCurrentWeekProgram } from "@/features/meetings/application/meeting.service";
import { getNextMeeting } from "@/features/meetings/domain/next-meeting";
import { NextMeetingSection } from "@/features/meetings/ui/NextMeetingSection";
import { getServerDictionary } from "@/lib/i18n/server";
import { CalendarDays } from "lucide-react";
import Link from "next/link";

interface NextMeetingCardProps {
  organizationId: string;
  organizationSlug: string;
  userName: string;
}

/**
 * Resumo da próxima reunião (meio de semana ou fim de semana).
 * Server Component sem JS no cliente para o fetch: some silenciosamente só
 * quando a organização não tem conexão (a página de Reuniões orienta) ou não
 * há mais reunião nesta semana; erro de carga vira cartão explícito com saída.
 * O resumo + modal interativo ficam no client `NextMeetingSection`.
 */
export async function NextMeetingCard({
  organizationId,
  organizationSlug,
  userName,
}: NextMeetingCardProps) {
  let state: Awaited<ReturnType<typeof getCurrentWeekProgram>>;
  try {
    state = await getCurrentWeekProgram(organizationId);
  } catch {
    return null;
  }
  if (!state.connected) return null;

  const t = await getServerDictionary();

  if ("error" in state) {
    return (
      <section aria-labelledby="home-reunioes-erro">
        <h2
          id="home-reunioes-erro"
          className="flex items-center gap-2 text-base font-semibold text-foreground"
        >
          <CalendarDays className="size-4 text-meeting" aria-hidden="true" />
          {t.meetings.title}
        </h2>
        <div className="mt-3 rounded-xl border border-meeting/25 bg-meeting/10 p-4">
          <p className="text-sm text-muted-foreground">{t.meetings.loadErrorDescription}</p>
          <Link
            href={`/org/${organizationSlug}/reunioes`}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full bg-meeting px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-meeting/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meeting"
          >
            {t.home.nextMeeting.viewProgram}
          </Link>
        </div>
      </section>
    );
  }

  const next = getNextMeeting(state.week, userName);
  if (!next) return null;

  return (
    <NextMeetingSection
      weekStart={state.week.weekStart}
      weekEnd={state.week.weekEnd}
      midweek={state.week.midweek}
      weekend={state.week.weekend}
      duties={state.week.duties}
      defaultKind={next.kind}
      organizationSlug={organizationSlug}
    />
  );
}
