"use server";
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

export async function getSurveyPinsAction(
  organizationId: string,
): Promise<ActionResult<SurveyPin[]>> {
  try {
    await requireOrgMember(organizationId);
    const pins = await getSurveyPins(organizationId);
    return { success: true, data: pins };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "No autorizado" };
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
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al guardar los pins",
    };
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
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al confirmar el pin",
    };
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
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al cancelar el pin",
    };
  }
}
