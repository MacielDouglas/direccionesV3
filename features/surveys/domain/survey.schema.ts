import { z } from "zod";

export const pinCoordinateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const createPinsSchema = z.object({
  organizationId: z.string().min(1),
  pins: z
    .array(pinCoordinateSchema)
    .min(1, "Debe haber al menos un pin")
    .max(100, "Máximo 100 pins por vez"),
  status: z.enum(["PENDING", "SUGGESTED", "CONFIRMED"]), // ← adicionar CONFIRMED
});

export const confirmPinSchema = z.object({
  pinId: z.string().min(1),
});

export const cancelPinSchema = z.object({
  pinId: z.string().min(1),
});

export type CreatePinsSchema = z.infer<typeof createPinsSchema>;
export type ConfirmPinSchema = z.infer<typeof confirmPinSchema>;
export type CancelPinSchema = z.infer<typeof cancelPinSchema>;
