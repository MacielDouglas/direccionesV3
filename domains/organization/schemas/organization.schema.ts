import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(50, "El nombre no puede superar los 50 caracteres."),
  slug: z
    .string()
    .min(2, "El slug debe tener al menos 2 caracteres.")
    .max(50, "El slug no puede superar los 50 caracteres.")
    .regex(
      /^[\w_]+$/,
      "El slug solo puede contener letras, números y guiones bajos.",
    ),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
