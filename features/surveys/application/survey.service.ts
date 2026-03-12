import { prisma } from "@/lib/prisma";
import type {
  CreatePinsInput,
  ConfirmPinInput,
  CancelPinInput,
} from "../types/survey.types";

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

export async function createSurveyPins(input: CreatePinsInput, userId: string) {
  const survey = await getOrCreateSurvey(input.organizationId);

  await prisma.surveyPin.createMany({
    data: input.pins.map((pin) => ({
      surveyId: survey.id,
      latitude: pin.latitude,
      longitude: pin.longitude,
      status: input.status,
      createdById: userId,
    })),
  });

  return prisma.surveyPin.findMany({
    where: { surveyId: survey.id, createdById: userId },
    include: { createdBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: input.pins.length,
  });
}

export async function confirmSurveyPin(input: ConfirmPinInput) {
  return prisma.surveyPin.update({
    where: { id: input.pinId },
    data: { status: "CONFIRMED", confirmedById: input.userId },
    include: { createdBy: { select: { name: true } } },
  });
}

export async function cancelSurveyPin(input: CancelPinInput) {
  return prisma.surveyPin.update({
    where: { id: input.pinId },
    data: { status: "CANCELLED" },
    include: { createdBy: { select: { name: true } } },
  });
}
