import { z } from "zod";
import { ADDRESS_TYPES } from "../types/address.types";

export const addressImageSchema = z.object({
  imageUrl: z.url().optional(),
  imageFile: z.instanceof(File).optional(),
  isCustomImage: z.boolean(),
});

/**
 * Schema usado no FORM (client side)
 */
export const addressFormSchema = z.object({
  addressType: z.enum(ADDRESS_TYPES),

  street: z.string().min(2, "Rua muito curta"),
  number: z.string().min(1, "Obrigatório"),
  neighborhood: z.string().min(2, "Bairro obrigatório"),
  city: z.string().min(3, "Cidade obrigatória"),

  latitude: z
    .number()
    .min(-90, "Latitude inválida")
    .max(90, "Latitude inválida"),

  longitude: z
    .number()
    .min(-180, "Longitude inválida")
    .max(180, "Longitude inválida"),

  image: addressImageSchema,

  info: z.string().max(300).optional(),

  businessName: z.string().nullable().optional(),

  active: z.boolean(),
  confirmed: z.boolean(),
  invited: z.boolean(),
});

export type AddressFormData = z.infer<typeof addressFormSchema>;

// schema para prisma (server side)
export const addressPersistenceSchema = addressFormSchema.extend({
  organizationId: z.uuid(),

  createdUserId: z.uuid(),
  updatedUserId: z.uuid().optional().nullable(),
});

export type AddressPersistenceInput = z.infer<typeof addressPersistenceSchema>;
