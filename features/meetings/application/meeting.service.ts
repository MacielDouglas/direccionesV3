import type {
  MeetingRangePayload,
  MeetingWeekPayload,
} from "@/features/meetings/domain/meeting.schema";
import { fetchDecryptedRange } from "@/features/meetings/infrastructure/meeting-api";
import { getBrasiliaWeekRange } from "@/features/meetings/utils/meeting-week";
import { prisma } from "@/lib/prisma";
import { requireOrgMember } from "@/server/users";

export interface MeetingConnectionStatus {
  connected: boolean;
  baseUrl: string | null;
  updatedAt: string | null;
}

export type CurrentWeekState =
  | { connected: false }
  | { connected: true; week: StoredWeekProgram }
  | { connected: true; error: string };

export interface StoredWeekProgram extends MeetingWeekPayload {
  fetchedAt: string;
}

/** Resumo de uma semana salva (para navegação entre semanas). */
export interface StoredWeekSummary {
  weekStart: string;
  weekEnd: string;
}

/** Conexão da organização (sem expor o token: só status + URL). */
export async function getMeetingConnectionStatus(
  organizationId: string,
): Promise<MeetingConnectionStatus> {
  await requireOrgMember(organizationId);
  const connection = await prisma.meetingConnection.findUnique({
    where: { organizationId },
    select: { baseUrl: true, updatedAt: true },
  });
  if (!connection) return { connected: false, baseUrl: null, updatedAt: null };
  return {
    connected: true,
    baseUrl: connection.baseUrl,
    updatedAt: connection.updatedAt.toISOString(),
  };
}

function toStoredWeek(row: {
  weekStart: string;
  weekEnd: string;
  congregationName: string;
  payload: unknown;
  fetchedAt: Date;
}): StoredWeekProgram {
  const payload = row.payload as MeetingWeekPayload;
  return {
    weekStart: row.weekStart,
    weekEnd: row.weekEnd,
    generatedAt: payload.generatedAt,
    congregationName: row.congregationName || payload.congregationName,
    midweek: payload.midweek,
    weekend: payload.weekend,
    duties: payload.duties,
    cleaning: payload.cleaning ?? [],
    fetchedAt: row.fetchedAt.toISOString(),
  };
}

/**
 * Semanas com programação salva, da mais antiga à mais recente.
 * A chave `weekStart` (YYYY-MM-DD) ordena lexicograficamente.
 */
export async function listMeetingWeeks(organizationId: string): Promise<StoredWeekSummary[]> {
  await requireOrgMember(organizationId);
  const rows = await prisma.meetingWeekProgram.findMany({
    where: { organizationId },
    select: { weekStart: true, weekEnd: true },
    orderBy: { weekStart: "asc" },
  });
  return rows;
}

/** Uma semana salva específica (só do banco: sem busca no Meeting). */
export async function getStoredMeetingWeek(
  organizationId: string,
  weekStart: string,
): Promise<StoredWeekProgram | null> {
  await requireOrgMember(organizationId);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) return null;
  const stored = await prisma.meetingWeekProgram.findUnique({
    where: { organizationId_weekStart: { organizationId, weekStart } },
  });
  return stored ? toStoredWeek(stored) : null;
}

/**
 * Espelha exatamente o último envio do Meeting: insere/atualiza cada semana
 * recebida e apaga as semanas locais que não vieram no envio. O banco local
 * mantém sempre a última programação enviada — nada além dela.
 */
export async function mirrorRangeProgram(
  organizationId: string,
  range: MeetingRangePayload,
): Promise<void> {
  await requireOrgMember(organizationId);
  if (range.weeks.length === 0) throw new Error("Respuesta no válida.");
  const received = range.weeks.map((week) => week.weekStart);
  await prisma.$transaction([
    ...range.weeks.map((week) =>
      prisma.meetingWeekProgram.upsert({
        where: { organizationId_weekStart: { organizationId, weekStart: week.weekStart } },
        create: {
          organizationId,
          weekStart: week.weekStart,
          weekEnd: week.weekEnd,
          congregationName: week.congregationName || range.congregationName,
          payload: week as unknown as object,
        },
        update: {
          weekEnd: week.weekEnd,
          congregationName: week.congregationName || range.congregationName,
          payload: week as unknown as object,
          fetchedAt: new Date(),
        },
      }),
    ),
    prisma.meetingWeekProgram.deleteMany({
      where: { organizationId, weekStart: { notIn: received } },
    }),
  ]);
}

/**
 * Semana atual: serve do banco quando já existe snapshot; só busca no
 * Meeting (e espelha o intervalo inteiro) quando a semana atual ainda não
 * tem programação salva.
 */
export async function getCurrentWeekProgram(organizationId: string): Promise<CurrentWeekState> {
  await requireOrgMember(organizationId);
  const connection = await prisma.meetingConnection.findUnique({
    where: { organizationId },
  });
  if (!connection) return { connected: false };

  const { weekStart } = getBrasiliaWeekRange();
  const stored = await prisma.meetingWeekProgram.findUnique({
    where: { organizationId_weekStart: { organizationId, weekStart } },
  });
  if (stored) return { connected: true, week: toStoredWeek(stored) };

  let range: MeetingRangePayload;
  try {
    range = await fetchDecryptedRange(connection.baseUrl, connection.token);
    await mirrorRangeProgram(organizationId, range);
  } catch (error) {
    return {
      connected: true,
      error: error instanceof Error ? error.message : "No se pudo cargar la semana.",
    };
  }
  const fresh = await prisma.meetingWeekProgram.findUnique({
    where: { organizationId_weekStart: { organizationId, weekStart } },
  });
  if (!fresh) return { connected: true, error: "No se pudo cargar la semana." };
  return { connected: true, week: toStoredWeek(fresh) };
}
