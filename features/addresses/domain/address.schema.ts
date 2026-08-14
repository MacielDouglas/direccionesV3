import { z } from "zod";
import { ADDRESS_TYPES } from "../types/address.types";

export const addressImageSchema = z.object({
  imageUrl: z.string().nullable().optional(),
  imageFile: z.any().optional(),
  imageKey: z.string().nullable().optional(),
  isCustomImage: z.boolean().optional(),
});

export const addressFormSchema = z.object({
  addressType: z.enum(ADDRESS_TYPES),

  street: z.string().min(2, "La calle es demasiado corta."),
  number: z.string().min(1, "El número es obligatorio."),
  neighborhood: z.string().min(2, "El barrio es obligatorio."),
  city: z.string().min(3, "La ciudad es obligatoria."),

  latitude: z
    .number()
    .min(-90, "Latitud inválida.")
    .max(90, "Latitud inválida.")
    .nullable()
    .optional(),
  longitude: z
    .number()
    .min(-180, "Longitud inválida.")
    .max(180, "Longitud inválida.")
    .nullable()
    .optional(),

  image: addressImageSchema,

  info: z.string().max(300, "Máximo 300 caracteres.").optional(),
  businessName: z.string().nullable().optional(),

  active: z.boolean(),
  confirmed: z.boolean(),
  invited: z.boolean(),
});

export type AddressFormData = z.infer<typeof addressFormSchema>;

// Schema de criação — GPS obrigatório (validação reforçada no envio)
export const addressCreateSchema = addressFormSchema.superRefine((data, ctx) => {
  if (data.latitude == null || data.longitude == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["latitude"],
      message: "La ubicación GPS es obligatoria.",
    });
  }
});

export const addressPersistenceSchema = addressFormSchema.extend({
  organizationId: z.string().min(1),
  createdByPersonId: z.string().min(1),
  updatedByPersonId: z.string().min(1).optional().nullable(),
});

export type AddressPersistenceInput = z.infer<typeof addressPersistenceSchema>;

// Schema server-side derivado — sem duplicação
export const createAddressSchema = addressCreateSchema;
export type CreateAddressInput = AddressFormData;
