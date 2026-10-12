import type { MeetingAssignment } from "@/features/meetings/domain/meeting-section";
import type { MeetingDetail, MeetingWeekPayload } from "@/features/meetings/domain/meeting.schema";

export type NextMeetingKind = "midweek" | "weekend";

export interface NextMeeting {
  kind: NextMeetingKind;
  /** Data da reunião em YYYY-MM-DD. */
  date: string;
  /** Hora da primeira parte com horário (HH:MM) ou null. */
  startTime: string | null;
  totalParts: number;
  /** Partes onde o usuário participa (titular ou ajudante). */
  myParts: MeetingAssignment[];
}

/** Hoje em YYYY-MM-DD em America/Sao_Paulo. */
export function todayBrasiliaIso(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return parts;
}

/** Normaliza nome para comparação: sem acento, minúsculas, espaços únicos. */
export function normalizePersonName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function namesMatch(candidate: string, user: string): boolean {
  if (!candidate || !user) return false;
  if (candidate === user) return true;
  // Nome parcial só vale com 2+ palavras (evita "Ana" casar com "Mariana").
  const [shorter, longer] = candidate.length <= user.length ? [candidate, user] : [user, candidate];
  return shorter.split(" ").length >= 2 && longer.includes(shorter);
}

function isMyAssignment(assignment: MeetingAssignment, normalizedUser: string): boolean {
  if (!normalizedUser) return false;
  const holder = normalizePersonName(assignment.personName);
  const helper = normalizePersonName(assignment.helperPersonName);
  return namesMatch(holder, normalizedUser) || namesMatch(helper, normalizedUser);
}

/**
 * Próxima reunião da semana: a primeira entre meio de semana e fim de semana
 * com data >= hoje (Brasília). Retorna null quando não há mais reunião na semana.
 */
export function getNextMeeting(
  week: MeetingWeekPayload,
  userName: string,
  todayIso: string = todayBrasiliaIso(),
): NextMeeting | null {
  const candidates = [week.midweek, week.weekend].filter(
    (detail): detail is MeetingDetail => detail !== null && detail.date >= todayIso,
  );
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const next = candidates[0];
  if (!next) return null;

  const normalizedUser = normalizePersonName(userName);
  const startTime =
    next.assignments.find((assignment) => assignment.startTime.trim() !== "")?.startTime ?? null;

  return {
    kind: next.kind,
    date: next.date,
    startTime,
    totalParts: next.assignments.length,
    myParts: next.assignments.filter((assignment) => isMyAssignment(assignment, normalizedUser)),
  };
}
