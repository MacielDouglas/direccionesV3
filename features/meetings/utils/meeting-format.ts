import type { MeetingLocale } from "@/features/meetings/domain/meeting-section";
import type { MeetingDetail } from "@/features/meetings/domain/meeting.schema";

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

/** Hora da primeira parte com horário (HH:MM) ou null. */
export function firstStartTime(meeting: MeetingDetail): string | null {
  return meeting.assignments.find((a) => a.startTime.trim() !== "")?.startTime ?? null;
}

/** Estudo bíblico da congregação: o segundo designado é o leitor, não o ajudante. */
export function isCongregationBibleStudy(section: string): boolean {
  const normalized = section
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase();
  return normalized.includes("BIBLICO") && normalized.includes("CONGREGACION");
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
