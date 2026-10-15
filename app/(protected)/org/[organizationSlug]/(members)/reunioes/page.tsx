import {
  getCurrentWeekProgram,
  listMeetingWeeks,
} from "@/features/meetings/application/meeting.service";
import { MeetingRetryButton } from "@/features/meetings/ui/MeetingRetryButton";
import { MeetingWeekView } from "@/features/meetings/ui/MeetingWeekView";
import { getServerDictionary, getServerLocale } from "@/lib/i18n/server";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { getCurrentUser } from "@/server/users";
import { CalendarX, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  return { title: t.meetings.title };
}

interface Props {
  params: Promise<{ organizationSlug: string }>;
}

export default async function ReunioesPage({ params }: Props) {
  const { organizationSlug } = await params;
  const [session, t, locale] = await Promise.all([
    getCurrentUser(),
    getServerDictionary(),
    getServerLocale(),
  ]);
  if (!session) redirect("/login");

  const organization = await getOrganizationBySlug(organizationSlug);
  if (!organization) notFound();

  const state = await getCurrentWeekProgram(organization.id);
  const weeks =
    state.connected && !("error" in state) ? await listMeetingWeeks(organization.id) : [];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 md:py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t.meetings.title}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{t.meetings.subtitle}</p>
      </header>

      {!state.connected ? (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-meeting/10 text-meeting-text"
            >
              <CalendarX className="size-5" aria-hidden="true" />
            </span>
            <h2 className="min-w-0 flex-1 text-base font-semibold tracking-tight text-foreground">
              {t.meetings.notConnectedTitle}
            </h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{t.meetings.notConnectedDescription}</p>
        </div>
      ) : "error" in state ? (
        <div role="alert" className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-meeting/10 text-meeting-text"
            >
              <TriangleAlert className="size-5" aria-hidden="true" />
            </span>
            <h2 className="min-w-0 flex-1 text-base font-semibold tracking-tight text-foreground">
              {t.meetings.loadErrorTitle}
            </h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{t.meetings.loadErrorDescription}</p>
          <div className="mt-4">
            <MeetingRetryButton />
          </div>
        </div>
      ) : (
        <MeetingWeekView
          week={state.week}
          weeks={weeks}
          organizationId={organization.id}
          texts={t.meetings}
          locale={locale}
        />
      )}
    </main>
  );
}
