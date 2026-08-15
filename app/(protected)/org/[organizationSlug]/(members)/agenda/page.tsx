import {
  getAgendaEventsByMonth,
  getAgendaFieldOptions,
  getOrgMembersForAgenda,
} from "@/features/agenda/application/agenda.service";
import { AgendaAdminForm } from "@/features/agenda/components/AgendaAdminForm";
import { AgendaPageClient } from "@/features/agenda/components/AgendaPageClient";
import { todayInBrasilia } from "@/features/agenda/utils/agenda-time";
import { monthLabel as monthLabelLocalized } from "@/features/agenda/utils/calendar-locale";
import { getServerDictionary, getServerLocale } from "@/lib/i18n/server";
import { getCurrentUser } from "@/server/users";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Agenda" };

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function AgendaPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { year, month } = await searchParams;
  const [session, t, locale] = await Promise.all([
    getCurrentUser(),
    getServerDictionary(),
    getServerLocale(),
  ]);
  if (!session) redirect("/login");

  const today = todayInBrasilia();
  const activeYear = year ? Number.parseInt(year) : today.year;
  const activeMonth = month ? Number.parseInt(month) : today.month;

  const person = session.person;
  if (!person?.organizationId) redirect("/organizations");

  const isAdminOrOwner = ["admin", "owner"].includes(session.memberRole?.role ?? "");

  const [events, members, fieldOptions] = await Promise.all([
    getAgendaEventsByMonth(person.organizationId, activeYear, activeMonth),
    isAdminOrOwner ? getOrgMembersForAgenda(person.organizationId) : Promise.resolve([]),
    isAdminOrOwner ? getAgendaFieldOptions(person.organizationId) : Promise.resolve(null),
  ]);

  const monthLabel = monthLabelLocalized(locale, activeMonth, activeYear);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 md:py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t.agenda.title}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{t.agenda.subtitle}</p>
      </header>

      <AgendaPageClient
        events={events}
        year={activeYear}
        month={activeMonth}
        monthLabel={monthLabel}
        organizationSlug={slug}
        canDelete={isAdminOrOwner}
        canEdit={isAdminOrOwner}
        members={members}
        fieldOptions={fieldOptions}
        adminContent={
          isAdminOrOwner && fieldOptions ? (
            <AgendaAdminForm
              organizationId={person.organizationId}
              organizationSlug={slug}
              members={members}
              fieldOptions={fieldOptions}
            />
          ) : undefined
        }
      />
    </main>
  );
}
