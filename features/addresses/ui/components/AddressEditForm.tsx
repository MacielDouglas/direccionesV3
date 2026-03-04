"use client";

import type { Address } from "@prisma/client";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTenant } from "@/providers/TenantProvider";
import { toast } from "sonner";
import AddressFields from "./AddressFields";
import type { AddressFormData } from "../../domain/address.schema";
import { uploadAddressImage } from "../../application/address-image.service";
import { updateAddressAction } from "../../application/address.actions";
import { useAddressEditForm } from "../../hooks/useAddressEditForm";

type Props = { address: Address };

export default function AddressEditForm({ address }: Props) {
  const form = useAddressEditForm(address);
  const { organization } = useTenant();
  const router = useRouter();
  const { isSubmitting } = form.formState;

  async function onSubmit(values: AddressFormData) {
    try {
      let imageUrl = values.image.imageUrl ?? null;
      let imageKey = values.image.imageKey ?? null;

      if (values.image.imageFile instanceof File) {
        const uploaded = await uploadAddressImage(values.image.imageFile, {
          organizationId: organization.id,
        });
        imageUrl = uploaded.publicUrl;
        imageKey = uploaded.key;
      }

      await updateAddressAction(address.id, {
        ...values,
        businessName:
          values.addressType === "House" ? null : values.businessName,
        image: { imageUrl, imageKey, isCustomImage: true },
      });

      toast.success("¡Dirección actualizada correctamente!");
      router.push(`/org/${organization.slug}/addresses/${address.id}`);
    } catch (error) {
      console.error("[AddressEditForm]", error);
      toast.error("Error al actualizar la dirección. Intente nuevamente.");
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

        <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t bg-background px-4 py-3 shadow-md">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="min-w-32"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Guardando…</span>
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
