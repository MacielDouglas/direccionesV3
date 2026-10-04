/**
 * Segunda–domingo da semana atual em America/Sao_Paulo (YYYY-MM-DD).
 * O Meeting publica a semana pela segunda-feira; o snapshot é chaveado por ela:
 * só busca no Meeting quando inicia uma semana sem programação salva.
 */
export function getBrasiliaWeekRange(now: Date = new Date()): {
  weekStart: string;
  weekEnd: string;
} {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const [year, month, day] = parts.split("-").map(Number);
  const noon = new Date(Date.UTC(year, month - 1, day, 12));
  const monday = new Date(noon);
  monday.setUTCDate(noon.getUTCDate() - ((noon.getUTCDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return {
    weekStart: monday.toISOString().slice(0, 10),
    weekEnd: sunday.toISOString().slice(0, 10),
  };
}
