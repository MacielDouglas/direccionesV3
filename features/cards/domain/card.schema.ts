import { z } from "zod";

export const createCardSchema = z.object({
  addressIds: z
    .array(z.string().uuid())
    .min(1, "Selecciona al menos una dirección"),
});

export const editCardSchema = z.object({
  addressIds: z
    .array(z.string().uuid())
    .min(1, "El card debe tener al menos una dirección"),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type EditCardInput = z.infer<typeof editCardSchema>;
