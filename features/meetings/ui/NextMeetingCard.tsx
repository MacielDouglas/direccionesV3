import { getCurrentWeekProgram } from "@/features/meetings/application/meeting.service";
import { getNextMeeting } from "@/features/meetings/domain/next-meeting";
import { getServerDictionary, getServerLocale } from "@/lib/i18n/server";
import { ChevronRight, Clock, UserRoundGroup } from "lucide-react";
import Link from "next/link";

interface NextMeetingCardProps {
  organizationId: string;
  organizationSlug: string;
  userName: string;
}

function parseDay(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

function formatLongDate(iso: string, locale: "pt" | "es"): string {
  const text = new Intl.DateTimeFormat(locale === "es" ? "es" : "pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(parseDay(iso));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Resumo da próxima reunião (meio de semana ou fim de semana).
 * Server Component sem JS no cliente: some silenciosamente quando
 * a organização não tem conexão com o Meeting ou a semana falhou.
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

  const [t, locale] = await Promise.all([getServerDictionary(), getServerLocale()]);
  const kindTitle = next.kind === "midweek" ? t.meetings.midweekTitle : t.meetings.weekendTitle;
  const partsLabel =
    next.totalParts === 1
      ? t.home.nextMeeting.partsCountSingular
      : t.home.nextMeeting.partsCount.replace("{count}", String(next.totalParts));

  return (
    <section aria-labelledby="next-meeting">
      <h2
        id="next-meeting"
        className="flex items-center gap-2 text-base font-semibold text-foreground"
      >
        <UserRoundGroup className="size-4 text-brand" aria-hidden="true" />
        {t.home.nextMeeting.title}
      </h2>

      <div className="mt-3 rounded-xl border border-border bg-card p-4 shadow-xs">
        <p className="text-sm font-semibold text-foreground">{kindTitle}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{formatLongDate(next.date, locale)}</p>
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
          <Clock className="size-3.5 text-brand" aria-hidden="true" />
          {next.startTime ?? t.home.nextMeeting.timeToBeDefined}
          <span className="text-muted-foreground">· {partsLabel}</span>
        </p>

        {next.myParts.length > 0 && (
          <div className="mt-3 border-t border-border pt-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t.home.nextMeeting.yourParts}
            </p>
            <ul className="mt-2 space-y-1.5">
              {next.myParts.map((part) => (
                <li
                  key={part.partKey}
                  className="flex items-baseline justify-between gap-3 text-sm"
                >
                  <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                    {part.title}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {part.startTime}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link
          href={`/org/${organizationSlug}/reunioes`}
          className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-brand transition-colors hover:text-brand-muted"
        >
          {t.home.nextMeeting.viewDetails}
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
