import { meetingBaseUrlSchema } from "@/features/meetings/domain/meeting.schema";

const DEFAULT_BASE_URL_ENV = "MEETING_PUBLIC_BASE_URL";

/**
 * URL base padrão do Meeting vinda do ambiente (server-only). Permite que o
 * owner cadastre só o token. Ausente ou inválida → undefined (aí o formulário
 * exige a URL manualmente).
 */
export function readDefaultBaseUrl(): string | undefined {
  const raw = process.env[DEFAULT_BASE_URL_ENV];
  if (!raw || raw.trim() === "") return undefined;
  const parsed = meetingBaseUrlSchema.safeParse(raw);
  return parsed.success ? parsed.data : undefined;
}
