import { getCurrentWeekProgram } from "@/features/meetings/application/meeting.service";
import { getNextMeeting } from "@/features/meetings/domain/next-meeting";
import { NextMeetingSection } from "@/features/meetings/ui/NextMeetingSection";

interface NextMeetingCardProps {
  organizationId: string;
  organizationSlug: string;
  userName: string;
}

/**
 * Resumo da próxima reunião (meio de semana ou fim de semana).
 * Server Component sem JS no cliente para o fetch: some silenciosamente quando
 * a organização não tem conexão com o Meeting ou a semana falhou.
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
  if (!state.connected || "error" in state) return null;

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
