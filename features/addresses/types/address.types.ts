import { AddressFormData } from "../domain/address.schema";

export const ADDRESS_TYPES = [
  "House",
  "Apartment",
  "Store",
  "Hotel",
  "Restaurant",
];

export type AddressType = (typeof ADDRESS_TYPES)[number];

export const ADDRESS_TYPE_LABEL: Record<AddressType, string> = {
  House: "Casa",
  Apartment: "Apartamento",
  Store: "Tienda",
  Hotel: "Hotel",
  Restaurant: "Restaurante",
};

export type FieldName = keyof AddressFormData;

export type BaseField = {
  label: string;
  description?: string;
};
