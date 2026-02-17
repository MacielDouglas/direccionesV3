"use client";

import { Button } from "@/components/ui/button";
import {
  AddressFormData,
  AddressFormInput,
  addressSchema,
} from "@/features/addresses/schemas/address.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import AddressFormFields from "./AddressFormFields";
import AddressTypeSelector from "./AddressTypeSelector";
import AddressGpsFields from "./AddressGpsFields";
import AddressImageField from "./AddressImageFields";

interface AddressFormProps {
  defaultValues?: Partial<AddressFormData>;
  mode?: "create" | "update";
  userId: string;
}

export default function AddressForm({
  defaultValues,
  mode = "create",
}: AddressFormProps) {
  const methods = useForm<AddressFormInput, unknown, AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      addressType: "House",
      active: true,
      ...defaultValues,
    },
  });

  const onSubmit = (data: AddressFormData) => {
    console.log(data);
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="flex flex-col gap-8 pb-10"
      >
        <div className="px-5 pt-5">
          <AddressTypeSelector />
          <AddressFormFields />
        </div>
        <div className="bg-stone-50 w-full border-t">
          <AddressGpsFields />
        </div>
        <AddressImageField />
        <Button
          type="submit"
          disabled={!methods.formState.isValid}
          className="w-[90%] mx-auto"
        >
          {mode === "create" ? "Crear dirección" : "Actualizar dirección"}
        </Button>
      </form>
    </FormProvider>
  );
}
