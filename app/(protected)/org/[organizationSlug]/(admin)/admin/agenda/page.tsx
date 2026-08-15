import { BackLink } from "@/components/ui/BackLink";
import {
  getAgendaEventsByMonth,
  getAgendaFieldOptions,
  getOrgMembersForAgenda,
} from "@/features/agenda/application/agenda.service";
import { AgendaAdminForm } from "@/features/agenda/components/AgendaAdminForm";
import { AgendaPageClient } from "@/features/agenda/components/AgendaPageClient";
import { AgendaPdfButton } from "@/features/agenda/components/AgendaPdfButton";
import { todayInBrasilia } from "@/features/agenda/utils/agenda-time";
import { monthLabel as monthLabelLocalized } from "@/features/agenda/utils/calendar-locale";
import { getServerDictionary, getServerLocale } from "@/lib/i18n/server";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { getCurrentUser } from "@/server/users";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ organizationSlug: string }>;
  searchParams: Promise<{ year?: string; month?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  return { title: t.admin.agenda };
}

export default async function AdminAgendaPage({ params, searchParams }: Props) {
  const { organizationSlug } = await params;
  const { year, month } = await searchParams;
  const [session, t, locale] = await Promise.all([
    getCurrentUser(),
    getServerDictionary(),
    getServerLocale(),
  ]);
  if (!session) redirect("/login");

  const role = session.memberRole?.role;
  if (!session.isSuperUser && (!role || !["admin", "owner"].includes(role))) {
    redirect(`/org/${organizationSlug}/agenda`);
  }

  const organization = await getOrganizationBySlug(organizationSlug);
  if (!organization) redirect("/");

  const organizationId = organization.id;
  const today = todayInBrasilia();
  const activeYear = year ? Number.parseInt(year) : today.year;
  const activeMonth = month ? Number.parseInt(month) : today.month;

  const [events, members, fieldOptions] = await Promise.all([
    getAgendaEventsByMonth(organizationId, activeYear, activeMonth),
    getOrgMembersForAgenda(organizationId),
    getAgendaFieldOptions(organizationId),
  ]);

  const monthLabel = monthLabelLocalized(locale, activeMonth, activeYear);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 md:py-10">
      <BackLink href={`/org/${organizationSlug}/admin`} className="mb-4" />
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t.admin.agenda}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{t.agenda.adminDescription}</p>
      </header>

      <AgendaPageClient
        events={events}
        year={activeYear}
        month={activeMonth}
        monthLabel={monthLabel}
        organizationSlug={organizationSlug}
        canDelete={true}
        canEdit={true}
        members={members}
        fieldOptions={fieldOptions}
        adminContent={
          <AgendaAdminForm
            organizationId={organizationId}
            organizationSlug={organizationSlug}
            members={members}
            fieldOptions={fieldOptions}
          />
        }
        footerContent={
          <div className="flex items-center justify-center">
            <AgendaPdfButton
              events={events}
              monthLabel={monthLabel}
              month={activeMonth}
              year={activeYear}
            />
          </div>
        }
      />
    </main>
  );
}
