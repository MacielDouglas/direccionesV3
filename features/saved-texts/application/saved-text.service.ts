import { prisma } from "@/lib/prisma";
import type { SavedTextField } from "../domain/saved-text.schema";

export interface SavedTextItem {
  value: string;
  count: number;
}

export type SavedTextsByField = Record<SavedTextField, SavedTextItem[]>;

const ADDRESS_COLUMNS: Record<string, "street" | "neighborhood" | "city"> = {
  street: "street",
  neighborhood: "neighborhood",
  city: "city",
};

const AGENDA_COLUMNS: Record<string, "saida" | "tipo" | "territorio"> = {
  saida: "saida",
  tipo: "tipo",
  territorio: "territorio",
};

const byValue = (a: SavedTextItem, b: SavedTextItem) => a.value.localeCompare(b.value);

export async function getSavedTexts(organizationId: string): Promise<SavedTextsByField> {
  const [streets, neighborhoods, cities] = await Promise.all([
    prisma.address.groupBy({
      by: ["street"],
      where: { organizationId },
      _count: { _all: true },
    }),
    prisma.address.groupBy({
      by: ["neighborhood"],
      where: { organizationId },
      _count: { _all: true },
    }),
    prisma.address.groupBy({
      by: ["city"],
      where: { organizationId },
      _count: { _all: true },
    }),
  ]);

  const [saidaOptions, tipoOptions, territorioOptions, saidaUsage, tipoUsage, territorioUsage] =
    await Promise.all([
      prisma.agendaFieldOption.findMany({
        where: { organizationId, field: "saida" },
        select: { value: true },
      }),
      prisma.agendaFieldOption.findMany({
        where: { organizationId, field: "tipo" },
        select: { value: true },
      }),
      prisma.agendaFieldOption.findMany({
        where: { organizationId, field: "territorio" },
        select: { value: true },
      }),
      prisma.agendaEvent.groupBy({
        by: ["saida"],
        where: { organizationId, saida: { not: null } },
        _count: { _all: true },
      }),
      prisma.agendaEvent.groupBy({
        by: ["tipo"],
        where: { organizationId, tipo: { not: null } },
        _count: { _all: true },
      }),
      prisma.agendaEvent.groupBy({
        by: ["territorio"],
        where: { organizationId, territorio: { not: null } },
        _count: { _all: true },
      }),
    ]);

  function withAgendaCounts(
    options: { value: string }[],
    rows: { saida?: string | null; tipo?: string | null; territorio?: string | null }[],
    key: "saida" | "tipo" | "territorio",
  ): SavedTextItem[] {
    const countByValue = new Map<string, number>();
    for (const row of rows) {
      const value = row[key];
      const count = (row as { _count: { _all: number } })._count._all;
      if (value) countByValue.set(value, count);
    }
    for (const opt of options) {
      if (!countByValue.has(opt.value)) countByValue.set(opt.value, 0);
    }
    return [...countByValue.entries()].map(([value, count]) => ({ value, count })).sort(byValue);
  }

  return {
    street: streets.map((r) => ({ value: r.street, count: r._count._all })).sort(byValue),
    neighborhood: neighborhoods
      .map((r) => ({ value: r.neighborhood, count: r._count._all }))
      .sort(byValue),
    city: cities.map((r) => ({ value: r.city, count: r._count._all })).sort(byValue),
    saida: withAgendaCounts(saidaOptions, saidaUsage, "saida"),
    tipo: withAgendaCounts(tipoOptions, tipoUsage, "tipo"),
    territorio: withAgendaCounts(territorioOptions, territorioUsage, "territorio"),
  };
}

export async function renameSavedText(params: {
  organizationId: string;
  field: SavedTextField;
  from: string;
  to: string;
}): Promise<{ updated: number }> {
  const { organizationId, field, from, to } = params;
  const addressColumn = ADDRESS_COLUMNS[field];
  if (addressColumn) {
    const result = await prisma.address.updateMany({
      where: { organizationId, [addressColumn]: from },
      data: { [addressColumn]: to },
    });
    return { updated: result.count };
  }

  const agendaColumn = AGENDA_COLUMNS[field];
  const events = await prisma.agendaEvent.updateMany({
    where: { organizationId, [agendaColumn]: from },
    data: { [agendaColumn]: to },
  });
  await prisma.$transaction([
    prisma.agendaFieldOption.upsert({
      where: { organizationId_field_value: { organizationId, field, value: to } },
      create: { organizationId, field, value: to },
      update: {},
    }),
    prisma.agendaFieldOption.deleteMany({
      where: { organizationId, field, value: from },
    }),
  ]);
  return { updated: events.count };
}

export async function mergeSavedTexts(params: {
  organizationId: string;
  field: SavedTextField;
  froms: string[];
  to: string;
}): Promise<{ updated: number }> {
  const { organizationId, field, froms, to } = params;
  const addressColumn = ADDRESS_COLUMNS[field];
  if (addressColumn) {
    const result = await prisma.address.updateMany({
      where: { organizationId, [addressColumn]: { in: froms } },
      data: { [addressColumn]: to },
    });
    return { updated: result.count };
  }

  const agendaColumn = AGENDA_COLUMNS[field];
  const events = await prisma.agendaEvent.updateMany({
    where: { organizationId, [agendaColumn]: { in: froms } },
    data: { [agendaColumn]: to },
  });
  await prisma.$transaction([
    prisma.agendaFieldOption.upsert({
      where: { organizationId_field_value: { organizationId, field, value: to } },
      create: { organizationId, field, value: to },
      update: {},
    }),
    prisma.agendaFieldOption.deleteMany({
      where: {
        organizationId,
        field,
        value: { in: froms.filter((v) => v !== to) },
      },
    }),
  ]);
  return { updated: events.count };
}
