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
  imageUrl: z.string().max(2000).nullable().optional(),
  imageFile: z.any().optional(),
  imageKey: z.string().max(500).nullable().optional(),
  isCustomImage: z.boolean().optional(),
});

export function createAddressFormSchema(messages: AddressFormMessages = defaultMessages) {
  return z.object({
    addressType: z.enum(ADDRESS_TYPES),

    street: z.string().trim().min(2, messages.streetTooShort).max(200),
    number: z.string().trim().min(1, messages.numberRequired).max(20),
    neighborhood: z.string().trim().min(2, messages.neighborhoodRequired).max(200),
    city: z.string().trim().min(3, messages.cityRequired).max(200),

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

    info: z
      .string()
      .trim()
      .max(300, messages.infoTooLong)
      .refine((v) => !/<\s*script/i.test(v), "Contenido no permitido.")
      .refine((v) => !/javascript\s*:/i.test(v), "Contenido no permitido.")
      .optional(),
    businessName: z
      .string()
      .trim()
      .max(200)
      .refine((v) => !/<\s*script/i.test(v), "Contenido no permitido.")
      .nullable()
      .optional(),

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
const xssFree = (v: string) =>
  !/<\s*script/i.test(v) && !/javascript\s*:/i.test(v) && !/\son\w+\s*=/i.test(v);

export const updateAddressSchema = z
  .object({
    addressType: z.enum(ADDRESS_TYPES),
    street: z.string().trim().min(2).max(200).refine(xssFree, "Contenido no permitido."),
    number: z.string().trim().min(1).max(20).refine(xssFree, "Contenido no permitido."),
    neighborhood: z.string().trim().min(2).max(200).refine(xssFree, "Contenido no permitido."),
    city: z.string().trim().min(3).max(200).refine(xssFree, "Contenido no permitido."),
    latitude: z.number().min(-90).max(90).nullable().optional(),
    longitude: z.number().min(-180).max(180).nullable().optional(),
    image: addressImageSchema.refine((image) => {
      if (!image.imageUrl) return true;
      if (image.imageUrl.length > 2000) return false;
      try {
        const url = new URL(image.imageUrl);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, "URL de imagen inválida."),
    info: z
      .string()
      .trim()
      .max(300)
      .refine(xssFree, "Contenido no permitido.")
      .nullable()
      .optional(),
    businessName: z
      .string()
      .trim()
      .max(200)
      .refine(xssFree, "Contenido no permitido.")
      .nullable()
      .optional(),
    active: z.boolean(),
    confirmed: z.boolean(),
  })
  .strict();
