"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  createPinsSchema,
  confirmPinSchema,
  cancelPinSchema,
} from "../domain/survey.schema";
import {
  createSurveyPins,
  confirmSurveyPin,
  cancelSurveyPin,
  getSurveyPins,
} from "./survey.service";
import type { SurveyPin } from "../types/survey.types";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function getSurveyPinsAction(
  organizationId: string,
): Promise<ActionResult<SurveyPin[]>> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "No autorizado" };
  try {
    const pins = await getSurveyPins(organizationId);
    return { success: true, data: pins };
  } catch {
    return { success: false, error: "Error al obtener los pins" };
  }
}

export async function createSurveyPinsAction(
  input: unknown,
): Promise<ActionResult<SurveyPin[]>> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "No autorizado" };

  const parsed = createPinsSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  try {
    const pins = await createSurveyPins(parsed.data, session.user.id);
    return { success: true, data: pins };
  } catch {
    return { success: false, error: "Error al guardar los pins" };
  }
}

export async function confirmSurveyPinAction(
  pinId: string,
): Promise<ActionResult<SurveyPin>> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "No autorizado" };

  const parsed = confirmPinSchema.safeParse({ pinId });
  if (!parsed.success) return { success: false, error: "Pin inválido" };

  try {
    const pin = await confirmSurveyPin({
      pinId: parsed.data.pinId,
      userId: session.user.id,
    });
    return { success: true, data: pin };
  } catch {
    return { success: false, error: "Error al confirmar el pin" };
  }
}

export async function cancelSurveyPinAction(
  pinId: string,
): Promise<ActionResult<SurveyPin>> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "No autorizado" };

  const parsed = cancelPinSchema.safeParse({ pinId });
  if (!parsed.success) return { success: false, error: "Pin inválido" };

  try {
    const pin = await cancelSurveyPin({
      pinId: parsed.data.pinId,
      userId: session.user.id,
    });
    return { success: true, data: pin };
  } catch {
    return { success: false, error: "Error al cancelar el pin" };
  }
}
