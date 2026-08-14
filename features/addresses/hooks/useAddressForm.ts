"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { AddressFormData } from "../domain/address.schema";
import { addressCreateSchema } from "../domain/address.schema";

export function useAddressForm(defaultValues?: Partial<AddressFormData>) {
  return useForm<AddressFormData>({
    resolver: zodResolver(addressCreateSchema),
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
