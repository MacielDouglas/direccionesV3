// Fuso fixo do aplicativo: Brasília (GMT-3), sem horário de verão.
export const BRASILIA_OFFSET_MS = -3 * 60 * 60 * 1000;

type EventDateLike = { date: Date; time: string | null };

// Instante "agora" deslocado para o relógio de Brasília.
// Use getUTC*() sobre o resultado para ler dia/hora no fuso fixo.
export function brasiliaNow(): Date {
  return new Date(Date.now() + BRASILIA_OFFSET_MS);
}

// Dia civil de hoje em Brasília (componentes em UTC).
export function todayInBrasilia(): { year: number; month: number; day: number } {
  const now = brasiliaNow();
  return { year: now.getUTCFullYear(), month: now.getUTCMonth(), day: now.getUTCDate() };
}

// Data de hoje em Brasília representada como Date em UTC (00:00Z).
export function todayInBrasiliaDateOnly(): Date {
  const { year, month, day } = todayInBrasilia();
  return new Date(Date.UTC(year, month, day, 0, 0, 0));
}

// O campo `date` do evento é gravado como 12:00 UTC (dia civil).
// Extrai o dia civil de forma determinística, independente do fuso do dispositivo.
export function eventDateParts(date: Date): { year: number; month: number; day: number } {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate(),
  };
}

// Horário exibido do evento. O campo `time` já é a string "HH:MM" escolhida pelo usuário.
export function eventTime(event: { time: string | null }): string {
  return event.time ?? "12:00";
}

// Instante real do início do evento em ms (UTC): dia civil + horário de Brasília.
export function eventStartUtcMs(event: EventDateLike): number {
  const { year, month, day } = eventDateParts(event.date);
  const [hours, minutes] = (event.time ?? "12:00").split(":").map(Number);
  return Date.UTC(year, month, day, hours, minutes, 0) - BRASILIA_OFFSET_MS;
}

// Verifica se o evento já começou, comparando no fuso fixo GMT-3.
export function isEventPast(event: EventDateLike): boolean {
  return eventStartUtcMs(event) <= Date.now();
}
