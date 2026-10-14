import type {
  BlockPlacement,
  MeetingAssignment,
  MeetingLocale,
  NumberedBlock,
} from "@/features/meetings/domain/meeting-section";
import type { MeetingCleaning, MeetingDetail } from "@/features/meetings/domain/meeting.schema";

export function parseDay(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

function localeTag(locale: MeetingLocale): string {
  return locale === "es" ? "es" : "pt-BR";
}

/** Data longa (ex.: "Quarta-feira, 8 de outubro"). */
export function formatLongDate(iso: string, locale: MeetingLocale): string {
  const text = new Intl.DateTimeFormat(localeTag(locale), {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(parseDay(iso));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Faixa da semana (ex.: "5 – 11 de outubro"). */
export function formatWeekRange(startIso: string, endIso: string, locale: MeetingLocale): string {
  const start = parseDay(startIso);
  const end = parseDay(endIso);
  const tag = localeTag(locale);
  if (start.getMonth() === end.getMonth()) {
    const month = new Intl.DateTimeFormat(tag, { month: "long" }).format(end);
    return `${start.getDate()} – ${end.getDate()} de ${month}`;
  }
  const short = (date: Date) =>
    new Intl.DateTimeFormat(tag, { month: "short" }).format(date).replace(/\./g, "");
  return `${start.getDate()} ${short(start)} – ${end.getDate()} ${short(end)}`;
}

/** Dia da semana abreviado sem ponto (ex.: "qua"). */
export function shortWeekday(iso: string, locale: MeetingLocale): string {
  return new Intl.DateTimeFormat(localeTag(locale), { weekday: "short" })
    .format(parseDay(iso))
    .replace(/\./g, "");
}

function shortMonth(date: Date, locale: MeetingLocale): string {
  return new Intl.DateTimeFormat(localeTag(locale), { month: "short" })
    .format(date)
    .replace(/\./g, "")
    .toLowerCase();
}

/** Dia curto para badges (ex.: "8 out"). */
export function formatShortDay(iso: string, locale: MeetingLocale): string {
  const date = parseDay(iso);
  return `${date.getDate()} ${shortMonth(date, locale)}`;
}

/** Data curta numérica (ex.: "15/10"). */
export function formatShortNumeric(iso: string): string {
  const date = parseDay(iso);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

/** Data completa numérica (ex.: "14/10/2026"). */
export function formatFullNumeric(iso: string): string {
  const date = parseDay(iso);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

export interface GroupedCleaning {
  key: string;
  sectorName: string;
  sectorNameEs: string;
  task: string;
  taskEs: string;
  people: string[];
}

/**
 * Agrupa a limpeza por setor: um setor com várias pessoas (ex.: Salón,
 * sempre em dupla) vira uma única linha com todas as pessoas.
 */
export function groupCleaningBySector(items: MeetingCleaning[]): GroupedCleaning[] {
  const groups = new Map<string, GroupedCleaning>();
  for (const item of items) {
    const key = `${item.date}__${item.sectorName.trim().toLowerCase()}`;
    const existing = groups.get(key);
    if (existing) {
      if (item.personName && !existing.people.includes(item.personName)) {
        existing.people.push(item.personName);
      }
    } else {
      groups.set(key, {
        key,
        sectorName: item.sectorName,
        sectorNameEs: item.sectorNameEs,
        task: item.task,
        taskEs: item.taskEs,
        people: item.personName ? [item.personName] : [],
      });
    }
  }
  return [...groups.values()];
}

/** Hora da primeira parte com horário (HH:MM) ou null. */
export function firstStartTime(meeting: MeetingDetail): string | null {
  return meeting.assignments.find((a) => a.startTime.trim() !== "")?.startTime ?? null;
}

function timeToMinutes(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function minutesToTime(total: number): string {
  const normalized = ((total % 1440) + 1440) % 1440;
  return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(normalized % 60).padStart(2, "0")}`;
}

/**
 * Minuto posterior do presidente: após a leitura da Bíblia e após cada parte
 * do ministério (espelha o relógio do Meeting: `treasures-reading` e `ministry-*`).
 */
function posteriorMinutes(part: MeetingAssignment): number {
  if (part.partKey === "treasures-reading") return 1;
  if (part.partKey.startsWith("ministry-")) return 1;
  return 0;
}

export interface TimedPart {
  part: MeetingAssignment;
  number: number | null;
  startTime: string | null;
}

export interface TimedBlock {
  section: string;
  parts: TimedPart[];
  hasCounted: boolean;
  placement: BlockPlacement;
}

/**
 * Relógio da reunião: hora de início de cada parte a partir do início da
 * reunião + duração de cada parte (+ posteriores). Sem horário, sem relógio.
 */
export function timeProgramParts(meeting: MeetingDetail, blocks: NumberedBlock[]): TimedBlock[] {
  const start = firstStartTime(meeting);
  let cursor = start ? timeToMinutes(start) : null;
  return blocks.map((block) => ({
    ...block,
    parts: block.parts.map((item) => {
      const timed: TimedPart = {
        ...item,
        startTime: cursor !== null ? minutesToTime(cursor) : null,
      };
      if (cursor !== null) {
        cursor += (item.part.durationMinutes ?? 0) + posteriorMinutes(item.part);
      }
      return timed;
    }),
  }));
}

/** Seção Seamos (ministério): subtítulo com wrap e ajudante com desfoque. */
export function isSeamosSection(section: string): boolean {
  return section === "SEAMOS MEJORES MAESTROS";
}

/**
 * Estudo bíblico da congregação (ou de A Sentinela): o segundo designado é
 * o leitor, não o ajudante (espelha `helperRoleOf` do Meeting).
 */
export function isReaderPart(part: MeetingAssignment): boolean {
  return part.partKey === "congregation-study" || part.partKey === "watchtower-study";
}

function normalizePhrase(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[….]+$/u, "");
}

function samePhrase(a: string, b: string): boolean {
  if (a === b) return true;
  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
  if (!longer.startsWith(shorter)) return false;
  const next = longer[shorter.length];
  return next === undefined || !/[\p{L}\p{N}]/u.test(next);
}

/** Remove frases repetidas (ex.: tema do cântico igual à descrição). */
export function dedupePhrases(phrases: string[]): string[] {
  const kept: string[] = [];
  for (const raw of phrases) {
    const text = raw.replace(/\s+/g, " ").trim();
    if (!text) continue;
    const normalized = normalizePhrase(text);
    if (!normalized) continue;
    if (kept.some((item) => samePhrase(normalized, normalizePhrase(item)))) continue;
    kept.push(text);
  }
  return kept;
}

/**
 * "Interno"/"Externo" ganham o prefixo do cargo (ex.: "Indicador Interno",
 * "Acomodador Externo"). Quem já traz o cargo não é alterado.
 */
export function formatAttendantPost(postLabel: string, attendantLabel: string): string {
  const trimmed = postLabel.trim();
  const normalized = trimmed
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase();
  if (/(ACOMODADOR|INDICADOR)/.test(normalized)) return postLabel;
  if (normalized === "INTERNO" || normalized === "EXTERNO") {
    return `${attendantLabel} ${trimmed}`;
  }
  return postLabel;
}
