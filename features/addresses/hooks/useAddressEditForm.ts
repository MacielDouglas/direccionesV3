"use client";

import type { Address } from "@prisma/client";
import { useForm } from "react-hook-form";
import type { AddressFormData } from "../domain/address.schema";
import { addressFormSchema } from "../domain/address.schema";
import { zodResolver } from "@hookform/resolvers/zod";

export function useAddressEditForm(address: Address) {
  return useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
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
      invited: address.invited,
      image: {
        imageUrl: address.image ?? undefined,
        imageKey: null,
        isCustomImage: !!address.image,
      },
    },
  });
}
