"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/server/users";
import {
  agendaEventSchema,
  type AgendaEventInput,
} from "../domain/agenda.schema";

async function requireAdminOrOwner() {
  const data = await getCurrentUser();
  if (!data) throw new Error("No autenticado.");
  const role = data.memberRole?.role;
  if (!role || !["admin", "owner"].includes(role))
    throw new Error("Sin permiso.");
  return data;
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
  const [hours, minutes] = (time ?? "00:00").split(":").map(Number);
  const localDate = new Date(year, month - 1, day, hours, minutes);

  await prisma.agendaEvent.create({
    data: {
      organizationId,
      date: localDate,
      time: time ?? null,
      conductorId: conductorId ?? null,
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
    await requireAdminOrOwner();
    const parsed = agendaEventSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    await createEvent(organizationId, parsed.data);

    revalidatePath(`/org/${organizationSlug}/agenda`);
    revalidatePath(`/org/${organizationSlug}/admin/agenda`);
    return {};
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Error al crear evento.",
    };
  }
}

export async function updateAgendaEventAction(
  eventId: string,
  organizationSlug: string,
  input: AgendaEventInput,
): Promise<{ error?: string }> {
  try {
    // const session = await requireAdminOrOwner();
    const parsed = agendaEventSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { date, time, conductorId, saida, tipo, territorio, info } =
      parsed.data;
    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = (time ?? "00:00").split(":").map(Number);
    const localDate = new Date(year, month - 1, day, hours, minutes);

    const event = await prisma.agendaEvent.findUnique({
      where: { id: eventId },
    });
    if (!event) return { error: "Evento no encontrado." };

    await prisma.agendaEvent.update({
      where: { id: eventId },
      data: {
        date: localDate,
        time: time ?? null,
        conductorId: conductorId ?? null,
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
    return {
      error: err instanceof Error ? err.message : "Error al actualizar evento.",
    };
  }
}

export async function deleteAgendaEventAction(
  eventId: string,
  organizationSlug: string,
): Promise<{ error?: string }> {
  try {
    await requireAdminOrOwner();
    await prisma.agendaEvent.delete({ where: { id: eventId } });
    revalidatePath(`/org/${organizationSlug}/agenda`);
    revalidatePath(`/org/${organizationSlug}/admin/agenda`);
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al eliminar." };
  }
}
