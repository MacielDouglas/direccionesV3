import { z } from "zod";

/** Token do enlace público do Meeting: 32 alfanuméricos (~190 bits, é a chave AES). */
export const meetingTokenSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9]{32}$/, "Token inválido (32 caracteres alfanuméricos).");

/**
 * Se o usuário colar o enlace completo (`<base>/api/public/programa/<token>`),
 * extrai só a origem para usar como URL base.
 */
function extractMeetingBaseUrl(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  const match = trimmed.match(/^(https?:\/\/[^/]+)\/api\/public\/programa\/[A-Za-z0-9]{32}\/?$/);
  return match?.[1] ?? value;
}

/** URL base do app Meeting. HTTPS obrigatório, exceto localhost (dev). */
export const meetingBaseUrlSchema = z.preprocess(
  extractMeetingBaseUrl,
  z
    .string()
    .trim()
    .url("URL inválida.")
    .refine((value) => {
      // O refine roda mesmo quando `.url()` falha (Zod v4): nunca lançar aqui.
      let parsed: URL;
      try {
        parsed = new URL(value);
      } catch {
        return false;
      }
      if (parsed.protocol === "https:") return true;
      return (
        parsed.protocol === "http:" &&
        (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
      );
    }, "Usa https (http solo en localhost).")
    .transform((value) => value.replace(/\/+$/, "")),
);

/**
 * baseUrl no formulário: string vazia vira undefined (a action cai no padrão
 * do servidor, `MEETING_PUBLIC_BASE_URL`).
 */
const meetingBaseUrlInputSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  meetingBaseUrlSchema.optional(),
);

export const meetingConnectionSchema = z.object({
  organizationId: z.string().min(1),
  baseUrl: meetingBaseUrlInputSchema,
  token: meetingTokenSchema,
});

export type MeetingConnectionInput = z.infer<typeof meetingConnectionSchema>;

/** Envelope cifrado servido por GET /api/public/programa/[token] do Meeting. */
export const meetingEnvelopeSchema = z.object({
  v: z.literal(1),
  alg: z.literal("aes-256-gcm"),
  iv: z.string().min(1),
  tag: z.string().min(1),
  data: z.string().min(1),
});

export type MeetingEnvelope = z.infer<typeof meetingEnvelopeSchema>;

const meetingAssignmentSchema = z.object({
  partKey: z.string(),
  section: z.string(),
  title: z.string(),
  subtitle: z.string(),
  startTime: z.string(),
  durationMinutes: z.number(),
  personName: z.string(),
  helperPersonName: z.string(),
  songNumber: z.number().nullable(),
  songTheme: z.string(),
  speakerCongregation: z.string(),
});

const meetingDetailSchema = z.object({
  kind: z.enum(["midweek", "weekend"]),
  date: z.string(),
  assignments: z.array(meetingAssignmentSchema),
});

const meetingDutySchema = z.object({
  date: z.string(),
  meetingKind: z.string(),
  dutyKey: z.string(),
  postLabel: z.string(),
  personName: z.string(),
});

const meetingCleaningSchema = z.object({
  date: z.string(),
  sectorName: z.string(),
  // Presente desde o Meeting novo; payloads antigos não trazem a chave.
  task: z.string().optional().default(""),
  personName: z.string(),
});

export type MeetingCleaning = z.infer<typeof meetingCleaningSchema>;

/** Semana decifrada (espelha PublicWeekPayload do Meeting). */
export const meetingWeekPayloadSchema = z.object({
  weekStart: z.string(),
  weekEnd: z.string(),
  generatedAt: z.string(),
  congregationName: z.string(),
  midweek: meetingDetailSchema.nullable(),
  weekend: meetingDetailSchema.nullable(),
  duties: z.array(meetingDutySchema),
  cleaning: z.array(meetingCleaningSchema).optional().default([]),
});

export type MeetingWeekPayload = z.infer<typeof meetingWeekPayloadSchema>;
export type MeetingDetail = z.infer<typeof meetingDetailSchema>;
