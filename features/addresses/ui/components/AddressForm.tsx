"use client";

import { useAddressForm } from "../../hooks/useAddressForm";
import { createAddressAction } from "../../application/address.actions";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import AddressFields from "./AddressFields";
import type { AddressFormData } from "../../domain/address.schema";
import { uploadAddressImage } from "../../application/address-image.service";
import { useTenant } from "@/providers/TenantProvider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AddressForm() {
  const form = useAddressForm();
  const { organization } = useTenant();
  const router = useRouter();
  const { isSubmitting } = form.formState;

  async function onSubmit(values: AddressFormData) {
    try {
      let imageUrl = values.image.imageUrl ?? null;
      let imageKey: string | null = null;

      if (values.image.imageFile instanceof File) {
        const uploaded = await uploadAddressImage(values.image.imageFile, {
          organizationId: organization.id,
        });
        imageUrl = uploaded.publicUrl;
        imageKey = uploaded.key;
      }

      const newAddress = await createAddressAction({
        ...values,
        businessName:
          values.addressType === "House" ? null : values.businessName,
        image: { imageUrl, imageKey, isCustomImage: true },
      });

      toast.success("¡Dirección creada correctamente!");
      router.push(`/org/${organization.slug}/addresses/${newAddress.id}`);
    } catch (error) {
      console.error("[AddressForm]", error);
      toast.error("Error al crear la dirección. Intente nuevamente.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-8 pb-10"
      >
        <div className="px-1 pt-1">
          <AddressFields />
        </div>

        <div className="sticky bottom-0 z-10 border-t bg-background px-4 py-3 shadow-md">
          <Button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Creando…</span>
              </>
            ) : (
              "Crear dirección"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
