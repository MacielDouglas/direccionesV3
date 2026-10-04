"use server";

import { toRole } from "@/domains/member/utils/toRole";
import { meetingConnectionSchema } from "@/features/meetings/domain/meeting.schema";
import { fetchDecryptedWeek } from "@/features/meetings/infrastructure/meeting-api";
import { readDefaultBaseUrl } from "@/features/meetings/infrastructure/meeting-config";
import { getBrasiliaWeekRange } from "@/features/meetings/utils/meeting-week";
import { canAccess } from "@/lib/autorize";
import { prisma } from "@/lib/prisma";
import { requireOrgMember } from "@/server/users";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const organizationIdSchema = z.string().min(1);

export interface MeetingActionResult {
  ok: boolean;
  error?: string;
}

// Mensagens de domínio conhecidas — qualquer outra vira genérica na UI.
const DOMAIN_ERRORS = new Set([
  "No autenticado.",
  "Sin permiso.",
  "Sin permiso para esta organización.",
  "Token inválido (32 caracteres alfanuméricos).",
  "URL inválida.",
  "Usa https (http solo en localhost).",
  "Informa la URL de Meeting.",
  "Enlace no encontrado (revocado o inválido).",
  "No se pudo conectar con Meeting.",
  "No se pudo descifrar (token inválido).",
  "Meeting respondió con error.",
  "Respuesta no válida.",
]);

function knownDomainError(error: unknown): string {
  if (error instanceof Error && DOMAIN_ERRORS.has(error.message)) return error.message;
  return "No se pudo completar. Inténtalo de nuevo.";
}

/** Owner da organização informada (superuser equivale a owner). */
async function requireOrgOwner(organizationId: string) {
  const data = await requireOrgMember(organizationId);
  if (data.isSuperUser) return data;
  const person = await prisma.person.findFirst({
    where: { organizationId, userId: data.user.id },
    select: { role: true },
  });
  const role = toRole(person?.role ?? null);
  if (!role || !canAccess(role, "owner")) throw new Error("Sin permiso.");
  return data;
}

function revalidateMeetings(slug: string) {
  revalidatePath(`/org/${slug}/reunioes`);
  revalidatePath(`/org/${slug}/admin/reunioes`);
  revalidatePath(`/org/${slug}/admin`);
}

/**
 * Cria a conexão: valida URL + token, testa contra o Meeting (busca e
 * decifra a semana atual) e só então salva. Uma por organização.
 */
export async function saveMeetingConnection(
  input: unknown,
  organizationSlug: string,
): Promise<MeetingActionResult> {
  const parsed = meetingConnectionSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message;
    return {
      ok: false,
      error: message && DOMAIN_ERRORS.has(message) ? message : "Revisa los datos informados.",
    };
  }
  try {
    const { organizationId, token } = parsed.data;
    await requireOrgOwner(organizationId);
    // Campo vazio → padrão do servidor (MEETING_PUBLIC_BASE_URL).
    const baseUrl = parsed.data.baseUrl ?? readDefaultBaseUrl();
    if (!baseUrl) return { ok: false, error: "Informa la URL de Meeting." };
    // Testa antes de salvar: garante URL + token válidos na hora.
    const payload = await fetchDecryptedWeek(baseUrl, token);
    const { weekStart, weekEnd } = getBrasiliaWeekRange();
    await prisma.$transaction([
      prisma.meetingConnection.upsert({
        where: { organizationId },
        create: { organizationId, baseUrl, token },
        update: { baseUrl, token },
      }),
      prisma.meetingWeekProgram.upsert({
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
      }),
    ]);
    revalidateMeetings(organizationSlug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: knownDomainError(error) };
  }
}

/** Força nova busca no Meeting para a semana atual (owner). */
export async function refreshMeetingWeek(
  input: unknown,
  organizationSlug: string,
): Promise<MeetingActionResult> {
  const parsed = organizationIdSchema.safeParse(
    typeof input === "object" && input !== null
      ? (input as Record<string, unknown>).organizationId
      : input,
  );
  if (!parsed.success) return { ok: false, error: "Revisa los datos informados." };
  try {
    const organizationId = parsed.data;
    await requireOrgOwner(organizationId);
    const connection = await prisma.meetingConnection.findUnique({
      where: { organizationId },
    });
    if (!connection) return { ok: false, error: "Sin conexión con Meeting." };
    const payload = await fetchDecryptedWeek(connection.baseUrl, connection.token);
    const { weekStart, weekEnd } = getBrasiliaWeekRange();
    await prisma.meetingWeekProgram.upsert({
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
    revalidateMeetings(organizationSlug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: knownDomainError(error) };
  }
}

/** Cancela a conexão: apaga credencial e semanas salvas (owner). */
export async function removeMeetingConnection(
  input: unknown,
  organizationSlug: string,
): Promise<MeetingActionResult> {
  const parsed = organizationIdSchema.safeParse(
    typeof input === "object" && input !== null
      ? (input as Record<string, unknown>).organizationId
      : input,
  );
  if (!parsed.success) return { ok: false, error: "Revisa los datos informados." };
  try {
    const organizationId = parsed.data;
    await requireOrgOwner(organizationId);
    await prisma.$transaction([
      prisma.meetingWeekProgram.deleteMany({ where: { organizationId } }),
      prisma.meetingConnection.deleteMany({ where: { organizationId } }),
    ]);
    revalidateMeetings(organizationSlug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: knownDomainError(error) };
  }
}
