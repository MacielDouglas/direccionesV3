import { createDecipheriv, createHash } from "node:crypto";
import {
  type MeetingEnvelope,
  type MeetingWeekPayload,
  meetingEnvelopeSchema,
  meetingWeekPayloadSchema,
} from "@/features/meetings/domain/meeting.schema";

const FETCH_TIMEOUT_MS = 15_000;

/** Chave AES-256 derivada do token: SHA-256(token) — mesmo cálculo do Meeting. */
function deriveKey(token: string): Buffer {
  return createHash("sha256").update(token, "utf8").digest();
}

function decryptEnvelope(token: string, envelope: MeetingEnvelope): MeetingWeekPayload {
  let plaintext: string;
  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      deriveKey(token),
      Buffer.from(envelope.iv, "base64"),
    );
    decipher.setAuthTag(Buffer.from(envelope.tag, "base64"));
    plaintext = Buffer.concat([
      decipher.update(Buffer.from(envelope.data, "base64")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    throw new Error("No se pudo descifrar (token inválido).");
  }
  const parsed = meetingWeekPayloadSchema.safeParse(JSON.parse(plaintext));
  if (!parsed.success) throw new Error("Respuesta no válida.");
  return parsed.data;
}

/**
 * Busca o envelope no Meeting e decifra (só no servidor: o token nunca
 * chega ao browser). 404 = enlace revogado ou inexistente no Meeting.
 */
export async function fetchDecryptedWeek(
  baseUrl: string,
  token: string,
): Promise<MeetingWeekPayload> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/public/programa/${token}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch {
    throw new Error("No se pudo conectar con Meeting.");
  }
  if (response.status === 404) throw new Error("Enlace no encontrado (revocado o inválido).");
  if (!response.ok) throw new Error("Meeting respondió con error.");
  const envelope = meetingEnvelopeSchema.safeParse(await response.json());
  if (!envelope.success) throw new Error("Respuesta no válida.");
  return decryptEnvelope(token, envelope.data);
}
