"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddressFormData, addressFormSchema } from "../domain/address.schema";

export function useAddressForm(defaultValues?: Partial<AddressFormData>) {
  return useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      addressType: "House",
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      latitude: 0,
      longitude: 0,

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
