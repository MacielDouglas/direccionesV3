import { z } from "zod";
import { ADDRESS_TYPES } from "../types/address.types";

const imageSchema = z.object({
  imageUrl: z.string().optional(),
  imageFile: z.any().optional(),
  isCustomImage: z.boolean().default(false),
});

export const addressSchema = z.object({
  addressType: z.enum(ADDRESS_TYPES),

  street: z.string().min(2, "Rua muito curta"),
  number: z.string().min(1, "Obrigatório"),
  neighborhood: z.string().min(2, "Bairro obrigatório"),
  city: z.string().min(3, "Cidade obrigatória"),

  latitude: z.coerce
    .number()
    .min(-90, "Latitude inválida")
    .max(90, "Latitude inválida"),

  longitude: z.coerce
    .number()
    .min(-180, "Longitude inválida")
    .max(180, "Longitude inválida"),

  image: imageSchema.refine(
    (img) => {
      if (img.isCustomImage) return !!img.imageUrl;
      return true;
    },
    {
      message: "Imagem customizada precisa ter URL",
    },
  ),

  info: z.string().max(300).optional(),
  businessName: z.string().max(40).optional(),

  active: z.boolean().default(true),
  confirmed: z.boolean().default(false),

  // createdUserId: z.string(),
});

export type AddressFormInput = z.input<typeof addressSchema>;
export type AddressFormData = z.output<typeof addressSchema>;
