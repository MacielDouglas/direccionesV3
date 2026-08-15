import { z } from "zod";
import { ADDRESS_TYPES } from "../types/address.types";

export interface AddressFormMessages {
  streetTooShort: string;
  numberRequired: string;
  neighborhoodRequired: string;
  cityRequired: string;
  invalidCoords: string;
  infoTooLong: string;
  gpsRequired: string;
}

const defaultMessages: AddressFormMessages = {
  streetTooShort: "La calle es demasiado corta.",
  numberRequired: "El número es obligatorio.",
  neighborhoodRequired: "El barrio es obligatorio.",
  cityRequired: "La ciudad es obligatoria.",
  invalidCoords: "Latitud inválida.",
  infoTooLong: "Máximo 300 caracteres.",
  gpsRequired: "La ubicación GPS es obligatoria.",
};

export const addressImageSchema = z.object({
  imageUrl: z.string().nullable().optional(),
  imageFile: z.any().optional(),
  imageKey: z.string().nullable().optional(),
  isCustomImage: z.boolean().optional(),
});

export function createAddressFormSchema(messages: AddressFormMessages = defaultMessages) {
  return z.object({
    addressType: z.enum(ADDRESS_TYPES),

    street: z.string().min(2, messages.streetTooShort),
    number: z.string().min(1, messages.numberRequired),
    neighborhood: z.string().min(2, messages.neighborhoodRequired),
    city: z.string().min(3, messages.cityRequired),

    latitude: z
      .number()
      .min(-90, messages.invalidCoords)
      .max(90, messages.invalidCoords)
      .nullable()
      .optional(),
    longitude: z
      .number()
      .min(-180, messages.invalidCoords)
      .max(180, messages.invalidCoords)
      .nullable()
      .optional(),

    image: addressImageSchema,

    info: z.string().max(300, messages.infoTooLong).optional(),
    businessName: z.string().nullable().optional(),

    active: z.boolean(),
    confirmed: z.boolean(),
  });
}

// Schema de criação — GPS obrigatório (validação reforçada no envio)
export function createAddressCreateSchema(messages: AddressFormMessages = defaultMessages) {
  return createAddressFormSchema(messages).superRefine((data, ctx) => {
    if (data.latitude == null || data.longitude == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["latitude"],
        message: messages.gpsRequired,
      });
    }
  });
}

export const addressFormSchema = createAddressFormSchema();
export type AddressFormData = z.infer<typeof addressFormSchema>;

export const addressPersistenceSchema = addressFormSchema.extend({
  organizationId: z.string().min(1),
  createdByPersonId: z.string().min(1),
  updatedByPersonId: z.string().min(1).optional().nullable(),
});

export type AddressPersistenceInput = z.infer<typeof addressPersistenceSchema>;

// Schema server-side derivado — sem duplicação
export const createAddressSchema = createAddressCreateSchema();
export type CreateAddressInput = AddressFormData;

// Schema de atualização — validação estrita server-side (.strict() rejeita campos extras)
export const updateAddressSchema = z
  .object({
    addressType: z.enum(ADDRESS_TYPES),
    street: z.string().min(2).max(200),
    number: z.string().min(1).max(20),
    neighborhood: z.string().min(2).max(200),
    city: z.string().min(3).max(200),
    latitude: z.number().min(-90).max(90).nullable().optional(),
    longitude: z.number().min(-180).max(180).nullable().optional(),
    image: addressImageSchema.refine((image) => {
      if (!image.imageUrl) return true;
      try {
        const url = new URL(image.imageUrl);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, "URL de imagen inválida."),
    info: z.string().max(300).nullable().optional(),
    businessName: z.string().max(200).nullable().optional(),
    active: z.boolean(),
    confirmed: z.boolean(),
  })
  .strict();
