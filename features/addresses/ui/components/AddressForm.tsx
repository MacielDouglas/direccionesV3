"use client";

import { useAddressForm } from "../../hooks/useAddressForm";
import { createAddressAction } from "../../application/address.actions";
import { Form } from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import AddressFields from "./AddressFields";
import { AddressFormData } from "../../domain/address.schema";

export default function AddressForm() {
  const form = useAddressForm();

  async function onSubmit(values: AddressFormData) {
    console.log("Submit: ", values);
    await createAddressAction({
      ...values,
    });

    form.reset();
  }

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
