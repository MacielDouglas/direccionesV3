import { prisma } from "@/lib/prisma";
import type { CancelPinInput, ConfirmPinInput, CreatePinsInput } from "../types/survey.types";

export async function getOrCreateSurvey(organizationId: string) {
  const existing = await prisma.survey.findFirst({ where: { organizationId } });
  if (existing) return existing;
  return prisma.survey.create({ data: { organizationId } });
}

export async function getSurveyPins(organizationId: string) {
  return prisma.surveyPin.findMany({
    where: { survey: { organizationId } },
    include: { createdBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createSurveyPins(input: CreatePinsInput, personId: string) {
  const survey = await getOrCreateSurvey(input.organizationId);

  await prisma.surveyPin.createMany({
    data: input.pins.map((pin) => ({
      surveyId: survey.id,
      latitude: pin.latitude,
      longitude: pin.longitude,
      status: input.status,
      createdByPersonId: personId,
    })),
  });

  return prisma.surveyPin.findMany({
    where: { surveyId: survey.id, createdByPersonId: personId },
    include: { createdBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: input.pins.length,
  });
}

export async function confirmSurveyPin(input: ConfirmPinInput) {
  const pin = await prisma.surveyPin.findUnique({
    where: { id: input.pinId },
    select: { survey: { select: { organizationId: true } } },
  });
  if (!pin) throw new Error("Pin no encontrado.");

  if (pin.survey.organizationId !== input.organizationId) {
    throw new Error("Sin permiso para este pin.");
  }

  return prisma.surveyPin.update({
    where: { id: input.pinId },
    data: { status: "CONFIRMED", confirmedByPersonId: input.personId },
    include: { createdBy: { select: { name: true } } },
  });
}

export async function cancelSurveyPin(input: CancelPinInput) {
  const pin = await prisma.surveyPin.findUnique({
    where: { id: input.pinId },
    select: { survey: { select: { organizationId: true } } },
  });
  if (!pin) throw new Error("Pin no encontrado.");

  if (pin.survey.organizationId !== input.organizationId) {
    throw new Error("Sin permiso para este pin.");
  }

  return prisma.surveyPin.update({
    where: { id: input.pinId },
    data: { status: "CANCELLED" },
    include: { createdBy: { select: { name: true } } },
  });
}
