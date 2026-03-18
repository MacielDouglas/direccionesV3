import { prisma } from "@/lib/prisma";

export async function getAgendaEventsByMonth(
  organizationId: string,
  year: number,
  month: number,
) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);

  return prisma.agendaEvent.findMany({
    where: { organizationId, date: { gte: start, lte: end } },
    include: {
      conductor: { select: { id: true, name: true, image: true } },
    },
    orderBy: { date: "asc" },
  });
}

export async function getAgendaFieldOptions(organizationId: string) {
  const options = await prisma.agendaFieldOption.findMany({
    where: { organizationId },
    orderBy: { value: "asc" },
    select: { field: true, value: true },
  });

  return {
    saida: options.filter((o) => o.field === "saida").map((o) => o.value),
    tipo: options.filter((o) => o.field === "tipo").map((o) => o.value),
    territorio: options
      .filter((o) => o.field === "territorio")
      .map((o) => o.value),
  };
}

export async function getOrgMembersForAgenda(organizationId: string) {
  return prisma.member.findMany({
    where: { organizationId },
    include: { user: { select: { id: true, name: true, image: true } } },
    orderBy: { user: { name: "asc" } },
  });
}
