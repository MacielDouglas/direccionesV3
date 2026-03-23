import { getCurrentUser } from "@/server/users";
import { redirect } from "next/navigation";
import { getAgendaEventsByMonth } from "@/features/agenda/application/agenda.service";
import type { Metadata } from "next";
import { AgendaPageClient } from "@/features/agenda/components/AgendaPageClient";

export const metadata: Metadata = { title: "Cronograma" };

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

export default async function AgendaPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { year, month } = await searchParams;
  const session = await getCurrentUser();
  if (!session) redirect("/sign-in");

  const now = new Date();
  const activeYear = year ? parseInt(year) : now.getFullYear();
  const activeMonth = month ? parseInt(month) : now.getMonth();

  const events = await getAgendaEventsByMonth(
    session.activeMember!.organizationId,
    activeYear,
    activeMonth,
  );

  const monthLabel = `${MONTHS_ES[activeMonth]} ${activeYear}`;

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-6 flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold">Cronograma</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Cronogramas y actividades del mes.
        </p>
      </header>

      <AgendaPageClient
        events={events}
        year={activeYear}
        month={activeMonth}
        monthLabel={monthLabel}
        organizationSlug={slug}
        canDelete={false}
      />
    </main>
  );
}
