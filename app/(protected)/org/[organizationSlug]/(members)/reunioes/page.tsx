import { getCurrentWeekProgram } from "@/features/meetings/application/meeting.service";
import { MeetingWeekView } from "@/features/meetings/ui/MeetingWeekView";
import { getServerDictionary, getServerLocale } from "@/lib/i18n/server";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { getCurrentUser } from "@/server/users";
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
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            {t.meetings.notConnectedTitle}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.meetings.notConnectedDescription}</p>
        </div>
      ) : "error" in state ? (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            {t.meetings.loadErrorTitle}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.meetings.loadErrorDescription}</p>
        </div>
      ) : (
        <MeetingWeekView week={state.week} texts={t.meetings} locale={locale} />
      )}
    </main>
  );
}
