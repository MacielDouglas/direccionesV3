import { getCurrentUser } from "@/server/users";
import { redirect } from "next/navigation";
import {
  getAgendaEventsByMonth,
  getAgendaFieldOptions,
  getOrgMembersForAgenda,
} from "@/features/agenda/application/agenda.service";
import { AgendaAdminForm } from "@/features/agenda/components/AgendaAdminForm";
import { AgendaEventList } from "@/features/agenda/components/AgendaEventList";
import { AgendaCalendar } from "@/features/agenda/components/AgendaCalendat";
import { AgendaPdfButton } from "@/features/agenda/components/AgendaPdfButton";

const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function AdminAgendaPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { year, month } = await searchParams;
  const session = await getCurrentUser();
  if (!session) redirect("/sign-in");

  const role = session.memberRole?.role;
  if (!role || !["admin", "owner"].includes(role)) {
    redirect(`/org/${slug}/agenda`);
  }

  const organizationId = session.activeMember!.organizationId;
  const now = new Date();
  const activeYear = year ? parseInt(year) : now.getFullYear();
  const activeMonth = month ? parseInt(month) : now.getMonth();

  const [events, members, fieldOptions] = await Promise.all([
    getAgendaEventsByMonth(organizationId, activeYear, activeMonth),
    getOrgMembersForAgenda(organizationId),
    getAgendaFieldOptions(organizationId), // ✅ novo
  ]);

  const monthLabel = `${MONTHS_ES[activeMonth]} ${activeYear}`;

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-6 flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold">Gestión de Agenda</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Crea y administra eventos del calendario.
        </p>
      </header>

      <AgendaCalendar events={events} year={activeYear} month={activeMonth} />

      <AgendaAdminForm
        organizationId={organizationId}
        organizationSlug={slug}
        members={members}
        fieldOptions={fieldOptions} // ✅ novo
      />

      <AgendaEventList
        events={events}
        monthLabel={monthLabel}
        organizationSlug={slug}
        canDelete={true}
        canEdit={true}
        members={members}
      />

      <AgendaPdfButton
        events={events}
        monthLabel={monthLabel}
        month={activeMonth}
        year={activeYear}
      />
    </main>
  );
}
