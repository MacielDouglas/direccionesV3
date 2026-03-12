export type PinStatus = "PENDING" | "SUGGESTED" | "CONFIRMED" | "CANCELLED";

export interface SurveyPin {
  id: string;
  surveyId: string;
  latitude: number;
  longitude: number;
  status: PinStatus;
  createdById: string;
  confirmedById: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: { name: string };
}

export interface CreatePinsInput {
  organizationId: string;
  pins: { latitude: number; longitude: number }[];
  status: "PENDING" | "SUGGESTED" | "CONFIRMED";
}

export interface ConfirmPinInput {
  pinId: string;
  userId: string;
}

export interface CancelPinInput {
  pinId: string;
  userId: string;
}
