"use server";
import { getServerDictionary } from "@/lib/i18n/server";
import { requireOrgMember } from "@/server/users";
import { cancelPinSchema, confirmPinSchema, createPinsSchema } from "../domain/survey.schema";
import type { SurveyPin } from "../types/survey.types";
import {
  cancelSurveyPin,
  confirmSurveyPin,
  createSurveyPins,
  getSurveyPins,
} from "./survey.service";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

// Mensagens de domínio conhecidas — qualquer outra (Prisma/DB/desconhecida) vira genérica
const DOMAIN_ERRORS = new Set([
  "No autenticado.",
  "Sin permiso para esta organización.",
  "Pin no encontrado.",
  "Sin permiso para este pin.",
]);

function knownDomainError(err: unknown): string | null {
  if (err instanceof Error && DOMAIN_ERRORS.has(err.message)) return err.message;
  return null;
}

export async function getSurveyPinsAction(
  organizationId: string,
): Promise<ActionResult<SurveyPin[]>> {
  try {
    await requireOrgMember(organizationId);
    const pins = await getSurveyPins(organizationId);
    return { success: true, data: pins };
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: log de erro intencional do servidor
    console.error("[surveys] getSurveyPinsAction", err);
    const t = await getServerDictionary();
    return { success: false, error: knownDomainError(err) ?? t.errors.generic };
  }
}

export async function createSurveyPinsAction(input: unknown): Promise<ActionResult<SurveyPin[]>> {
  const parsed = createPinsSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    const data = await requireOrgMember(parsed.data.organizationId);
    const pins = await createSurveyPins(parsed.data, data.person.id);
    return { success: true, data: pins };
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: log de erro intencional do servidor
    console.error("[surveys] createSurveyPinsAction", err);
    const t = await getServerDictionary();
    return { success: false, error: knownDomainError(err) ?? t.errors.generic };
  }
}

export async function confirmSurveyPinAction(
  pinId: string,
  organizationId: string,
): Promise<ActionResult<SurveyPin>> {
  const parsed = confirmPinSchema.safeParse({ pinId });
  if (!parsed.success) return { success: false, error: "Pin inválido" };

  try {
    const data = await requireOrgMember(organizationId);
    const pin = await confirmSurveyPin({
      pinId: parsed.data.pinId,
      personId: data.person.id,
      organizationId,
    });
    return { success: true, data: pin };
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: log de erro intencional do servidor
    console.error("[surveys] confirmSurveyPinAction", err);
    const t = await getServerDictionary();
    return { success: false, error: knownDomainError(err) ?? t.errors.generic };
  }
}

export async function cancelSurveyPinAction(
  pinId: string,
  organizationId: string,
): Promise<ActionResult<SurveyPin>> {
  const parsed = cancelPinSchema.safeParse({ pinId });
  if (!parsed.success) return { success: false, error: "Pin inválido" };

  try {
    const data = await requireOrgMember(organizationId);
    const pin = await cancelSurveyPin({
      pinId: parsed.data.pinId,
      personId: data.person.id,
      organizationId,
    });
    return { success: true, data: pin };
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: log de erro intencional do servidor
    console.error("[surveys] cancelSurveyPinAction", err);
    const t = await getServerDictionary();
    return { success: false, error: knownDomainError(err) ?? t.errors.generic };
  }
}
