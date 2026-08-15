"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Address } from "@prisma/client";
import { useForm } from "react-hook-form";
import type { AddressFormData } from "../domain/address.schema";
import { createAddressFormSchema } from "../domain/address.schema";

interface AddressWithImageKey extends Address {
  imageKey?: string | null;
}

export function useAddressEditForm(address: AddressWithImageKey) {
  const { t } = useI18n();

  return useForm<AddressFormData>({
    resolver: zodResolver(
      createAddressFormSchema({
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
      addressType: address.type as AddressFormData["addressType"],
      businessName: address.businessName ?? null,
      street: address.street,
      number: address.number,
      neighborhood: address.neighborhood,
      city: address.city,
      latitude: address.latitude ?? null,
      longitude: address.longitude ?? null,
      info: address.info ?? "",
      confirmed: address.confirmed,
      active: address.active,
      image: {
        imageUrl: address.image ?? undefined,
        imageKey: address.imageKey || null, // ✅ TypeScript feliz
        isCustomImage: !!address.imageKey,
      },
    },
  });
}
