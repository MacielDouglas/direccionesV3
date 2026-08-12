import type { Locale } from "@/lib/i18n/types";

const MONTHS: Record<Locale, string[]> = {
  pt: [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ],
  es: [
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
  ],
};

const WEEK_DAYS_SHORT: Record<Locale, string[]> = {
  pt: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  es: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
};

const WEEK_DAYS_LONG: Record<Locale, string[]> = {
  pt: [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ],
  es: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
};

const WEEK_DAYS_PLURAL: Record<Locale, string[]> = {
  pt: ["domingos", "segundas", "terças", "quartas", "quintas", "sextas", "sábados"],
  es: ["domingos", "lunes", "martes", "miércoles", "jueves", "viernes", "sábados"],
};

export function monthName(locale: Locale, month: number): string {
  return MONTHS[locale][month];
}

export function weekdayShort(locale: Locale, day: number): string {
  return WEEK_DAYS_SHORT[locale][day];
}

export function weekdayLong(locale: Locale, day: number): string {
  return WEEK_DAYS_LONG[locale][day];
}

export function weekdayPlural(locale: Locale, day: number): string {
  return WEEK_DAYS_PLURAL[locale][day];
}

export function monthLabel(locale: Locale, month: number, year: number): string {
  return `${MONTHS[locale][month]} ${year}`;
}

// Os eventos guardam o dia civil como 12:00 UTC. Ler com getUTC* mantém o dia
// estável em qualquer fuso do dispositivo, fixando a agenda em GMT-3.
export function dateLabelLong(locale: Locale, date: Date): string {
  return `${weekdayLong(locale, date.getUTCDay())}, ${date.getUTCDate()} de ${MONTHS[locale][date.getUTCMonth()]}`;
}

// Rótulo curto (ex.: "Seg, 5 ago") usado nos chips de eventos passados.
export function eventDateShort(locale: Locale, date: Date): string {
  return `${weekdayShort(locale, date.getUTCDay())}, ${date.getUTCDate()} ${MONTHS[locale][date.getUTCMonth()].slice(0, 3)}`;
}

export function formatDateInput(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
