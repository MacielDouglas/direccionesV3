import type { MeetingWeekPayload } from "@/features/meetings/domain/meeting.schema";
import { fetchDecryptedWeek } from "@/features/meetings/infrastructure/meeting-api";
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
 * Semana atual: serve do banco quando já existe snapshot; só busca no
 * Meeting (e salva) quando inicia uma semana sem programação salva.
 */
export async function getCurrentWeekProgram(organizationId: string): Promise<CurrentWeekState> {
  await requireOrgMember(organizationId);
  const connection = await prisma.meetingConnection.findUnique({
    where: { organizationId },
  });
  if (!connection) return { connected: false };

  const { weekStart, weekEnd } = getBrasiliaWeekRange();
  const stored = await prisma.meetingWeekProgram.findUnique({
    where: { organizationId_weekStart: { organizationId, weekStart } },
  });
  if (stored) return { connected: true, week: toStoredWeek(stored) };

  let payload: MeetingWeekPayload;
  try {
    payload = await fetchDecryptedWeek(connection.baseUrl, connection.token);
  } catch (error) {
    return {
      connected: true,
      error: error instanceof Error ? error.message : "No se pudo cargar la semana.",
    };
  }
  const saved = await prisma.meetingWeekProgram.upsert({
    where: { organizationId_weekStart: { organizationId, weekStart } },
    create: {
      organizationId,
      weekStart,
      weekEnd,
      congregationName: payload.congregationName,
      payload: payload as unknown as object,
    },
    update: {
      weekEnd,
      congregationName: payload.congregationName,
      payload: payload as unknown as object,
      fetchedAt: new Date(),
    },
  });
  return { connected: true, week: toStoredWeek(saved) };
}
