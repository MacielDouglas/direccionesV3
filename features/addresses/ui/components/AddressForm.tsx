"use client";

import { useAddressForm } from "../../hooks/useAddressForm";
import { createAddressAction } from "../../application/address.actions";
import { Form } from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import AddressFields from "./AddressFields";
import { AddressFormData } from "../../domain/address.schema";
import { uploadAddressImage } from "../../application/address-image.service";
import { useTenant } from "@/providers/TenantProvider";

export default function AddressForm() {
  const form = useAddressForm();
  const { organization } = useTenant();

  async function onSubmit(values: AddressFormData) {
    let imageUrl = values.image.imageUrl ?? null;
    let imageKey: string | null = null;

    // const data = values;

    if (values.addressType === "House") {
      values.businessName = null;
    }

    if (values.image.imageFile instanceof File) {
      const uploaded = await uploadAddressImage(values.image.imageFile, {
        organizationId: organization.id,
      });

      imageUrl = uploaded.publicUrl;
      imageKey = uploaded.key;
    }

    // console.log("VAlues a enviar...", values);

    await createAddressAction({
      ...values,
      image: {
        imageUrl,
        imageKey,
        isCustomImage: true,
      },
    });

    form.reset();
  }

  // async function onSubmit(values: AddressFormData) {
  //   await createAddressAction(values);
  //   form.reset();
  // }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-8 pb-10"
      >
        <div className="px-1 pt-1">
          <AddressFields control={form.control} />
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Form>
  );
}
