"use client";

import { Address } from "@prisma/client";
import { useForm } from "react-hook-form";
import { AddressFormData, addressFormSchema } from "../domain/address.schema";
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
      latitude: address.latitude ? Number(address.latitude) : 0,
      longitude: address.longitude ? Number(address.longitude) : 0,
      info: address.info ?? "",
      confirmed: address.confirmed,
      active: address.active,
      image: {
        imageUrl: address.image ?? undefined,
        imageKey: null,
        isCustomImage: !!address.image,
      },
      invited: address.invited,
    },
  });
}
