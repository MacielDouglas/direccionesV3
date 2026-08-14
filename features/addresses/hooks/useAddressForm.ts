"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { AddressFormData } from "../domain/address.schema";
import { createAddressCreateSchema } from "../domain/address.schema";

export function useAddressForm(defaultValues?: Partial<AddressFormData>) {
  const { t } = useI18n();

  return useForm<AddressFormData>({
    resolver: zodResolver(
      createAddressCreateSchema({
        streetTooShort: t.addresses.errorStreet,
        numberRequired: t.addresses.errorNumber,
        neighborhoodRequired: t.addresses.errorNeighborhood,
        cityRequired: t.addresses.errorCity,
        invalidCoords: t.addresses.gpsInvalidCoords,
        infoTooLong: t.addresses.errorInfo,
        gpsRequired: t.addresses.errorGps,
      }),
    ),
    defaultValues: {
      addressType: "House",
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      latitude: null,
      longitude: null,
      image: {
        imageUrl: undefined,
        imageFile: undefined,
        isCustomImage: false,
      },
      active: true,
      confirmed: false,
      invited: false,
      info: "",
      businessName: null,
      ...defaultValues,
    },
  });
}
