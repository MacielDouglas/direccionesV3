"use client";

import type { Address } from "@prisma/client";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTenant } from "@/providers/TenantProvider";
import { toast } from "sonner";
import { useState } from "react";
import AddressFields from "./AddressFields";
import type { AddressFormData } from "../../domain/address.schema";
import { updateAddressAction } from "../../application/address.actions";
import { useAddressEditForm } from "../../hooks/useAddressEditForm";
import { uploadFile } from "../../utils/uploadFile";

type Props = { address: Address };

export default function AddressEditForm({ address }: Props) {
  const form = useAddressEditForm(address);
  const { organization } = useTenant();
  const router = useRouter();
  const { isSubmitting } = form.formState;
  const [uploadProgress, setUploadProgress] = useState(0);

  async function onSubmit(values: AddressFormData) {
    try {
      let imageUrl = values.image.imageUrl ?? null;
      let imageKey = values.image.imageKey ?? null;

      if (values.image.imageFile instanceof File) {
        setUploadProgress(0);
        const uploaded = await uploadFile(
          values.image.imageFile,
          organization.id,
          setUploadProgress,
        );
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
    } finally {
      setUploadProgress(0);
    }
  }

  const submitLabel = () => {
    if (uploadProgress > 0 && uploadProgress < 100)
      return `Enviando imagen ${uploadProgress}%`;
    if (isSubmitting) return "Guardando…";
    return "Guardar cambios";
  };

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

          <div className="flex flex-col items-end gap-1">
            {uploadProgress > 0 && uploadProgress < 100 && (
              <progress
                value={uploadProgress}
                max={100}
                className="w-32"
                aria-label={`Subiendo imagen: ${uploadProgress}%`}
              />
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="min-w-32"
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  <span>{submitLabel()}</span>
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
