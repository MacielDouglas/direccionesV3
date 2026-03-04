"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AddressFormData } from "../domain/address.schema";
import { addressFormSchema } from "../domain/address.schema";

export function useAddressForm(defaultValues?: Partial<AddressFormData>) {
  return useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
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
