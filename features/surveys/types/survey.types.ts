export type PinStatus = "PENDING" | "SUGGESTED" | "CONFIRMED" | "CANCELLED";

export interface SurveyPin {
  id: string;
  surveyId: string;
  latitude: number;
  longitude: number;
  status: PinStatus;
  createdByPersonId: string | null;
  confirmedByPersonId: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: { name: string } | null;
}

export interface CreatePinsInput {
  organizationId: string;
  pins: { latitude: number; longitude: number }[];
  status: "PENDING" | "SUGGESTED" | "CONFIRMED";
}

export interface ConfirmPinInput {
  pinId: string;
  personId: string;
  organizationId: string;
}

export interface CancelPinInput {
  pinId: string;
  personId: string;
  organizationId: string;
}
