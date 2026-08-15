"use server";

import { getServerDictionary } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrOwner, requireOrgAdminOrOwner } from "@/server/users";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { type AgendaEventInput, agendaEventSchema } from "../domain/agenda.schema";

const eventIdSchema = z.string().cuid();
const organizationIdSchema = z.string().min(1);

// Mensagens de domínio conhecidas — qualquer outra (Prisma/DB/desconhecida) vira genérica
const DOMAIN_ERRORS = new Set([
  "No autenticado.",
  "Sin permiso.",
  "Sin permiso para esta organización.",
  "Sin organización activa.",
  "Evento no encontrado.",
]);

function knownDomainError(err: unknown): string | null {
  if (err instanceof Error && DOMAIN_ERRORS.has(err.message)) return err.message;
  return null;
}

// ✅ Salva valor como opção se ainda não existir
async function saveFieldOption(
  organizationId: string,
  field: string,
  value: string | null | undefined,
) {
  if (!value?.trim()) return;
  await prisma.agendaFieldOption.upsert({
    where: {
      organizationId_field_value: {
        organizationId,
        field,
        value: value.trim(),
      },
    },
    create: { organizationId, field, value: value.trim() },
    update: {}, // já existe — não faz nada
  });
}

async function createEvent(organizationId: string, input: AgendaEventInput) {
  const { date, time, conductorId, saida, tipo, territorio, info } = input;

  const [year, month, day] = date.split("-").map(Number);
  // Meio-dia UTC: mantém o dia civil estável em qualquer fuso do servidor e do cliente.
  // A hora exibida vem do campo `time` (string "HH:MM"), nunca do DateTime.
  const localDate = new Date(Date.UTC(year, month - 1, day, 12, 0));

  await prisma.agendaEvent.create({
    data: {
      organizationId,
      date: localDate,
      time: time ?? null,
      conductorPersonId: conductorId ?? null,
      saida: saida?.trim() ?? null,
      tipo: tipo?.trim() ?? null,
      territorio: territorio?.trim() ?? null,
      info: info?.trim() ?? null,
    },
  });

  // ✅ Persiste novas opções automaticamente
  await Promise.all([
    saveFieldOption(organizationId, "saida", saida),
    saveFieldOption(organizationId, "tipo", tipo),
    saveFieldOption(organizationId, "territorio", territorio),
  ]);
}

export async function createAgendaEventAction(
  organizationId: string,
  organizationSlug: string,
  input: AgendaEventInput,
): Promise<{ error?: string }> {
  try {
    if (!organizationIdSchema.safeParse(organizationId).success) {
      return { error: "Organización inválida." };
    }
    await requireOrgAdminOrOwner(organizationId);
    const parsed = agendaEventSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    await createEvent(organizationId, parsed.data);

    revalidatePath(`/org/${organizationSlug}/agenda`);
    revalidatePath(`/org/${organizationSlug}/admin/agenda`);
    return {};
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: log de erro intencional do servidor
    console.error("[agenda] createAgendaEventAction", err);
    const t = await getServerDictionary();
    return { error: knownDomainError(err) ?? t.errors.generic };
  }
}

export async function updateAgendaEventAction(
  eventId: string,
  organizationSlug: string,
  input: AgendaEventInput,
): Promise<{ error?: string }> {
  try {
    if (!eventIdSchema.safeParse(eventId).success) {
      return { error: "Evento inválido." };
    }
    const data = await requireAdminOrOwner();
    const organizationId = data.person?.organizationId;
    if (!organizationId) return { error: "Sin organización activa." };

    const parsed = agendaEventSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { date, time, conductorId, saida, tipo, territorio, info } = parsed.data;
    const [year, month, day] = date.split("-").map(Number);
    // Meio-dia UTC: mantém o dia civil estável em qualquer fuso.
    const localDate = new Date(Date.UTC(year, month - 1, day, 12, 0));

    const event = await prisma.agendaEvent.findFirst({
      where: { id: eventId, organizationId },
    });
    if (!event) return { error: "Evento no encontrado." };

    await prisma.agendaEvent.update({
      where: { id: eventId },
      data: {
        date: localDate,
        time: time ?? null,
        conductorPersonId: conductorId ?? null,
        saida: saida?.trim() ?? null,
        tipo: tipo?.trim() ?? null,
        territorio: territorio?.trim() ?? null,
        info: info?.trim() ?? null,
      },
    });

    await Promise.all([
      saveFieldOption(event.organizationId, "saida", saida),
      saveFieldOption(event.organizationId, "tipo", tipo),
      saveFieldOption(event.organizationId, "territorio", territorio),
    ]);

    revalidatePath(`/org/${organizationSlug}/agenda`);
    revalidatePath(`/org/${organizationSlug}/admin/agenda`);
    return {};
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: log de erro intencional do servidor
    console.error("[agenda] updateAgendaEventAction", err);
    const t = await getServerDictionary();
    return { error: knownDomainError(err) ?? t.errors.generic };
  }
}

export async function deleteAgendaEventAction(
  eventId: string,
  organizationSlug: string,
): Promise<{ error?: string }> {
  try {
    if (!eventIdSchema.safeParse(eventId).success) {
      return { error: "Evento inválido." };
    }
    const data = await requireAdminOrOwner();
    const organizationId = data.person?.organizationId;
    if (!organizationId) return { error: "Sin organización activa." };

    const event = await prisma.agendaEvent.findFirst({
      where: { id: eventId, organizationId },
    });
    if (!event) return { error: "Evento no encontrado." };

    await prisma.agendaEvent.delete({ where: { id: eventId } });
    revalidatePath(`/org/${organizationSlug}/agenda`);
    revalidatePath(`/org/${organizationSlug}/admin/agenda`);
    return {};
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: log de erro intencional do servidor
    console.error("[agenda] deleteAgendaEventAction", err);
    const t = await getServerDictionary();
    return { error: knownDomainError(err) ?? t.errors.generic };
  }
}
