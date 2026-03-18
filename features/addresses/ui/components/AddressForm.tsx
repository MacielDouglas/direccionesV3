// features/addresses/ui/components/AddressForm.tsx
"use client";

import { useAddressForm } from "../../hooks/useAddressForm";
import { createAddressAction } from "../../application/address.actions";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import AddressFields from "./AddressFields";
import type { AddressFormData } from "../../domain/address.schema";
import { useTenant } from "@/providers/TenantProvider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { uploadFile } from "../../utils/uploadFile";

interface Props {
  existingNeighborhoods: string[];
  existingCities: string[];
}

export default function AddressForm({
  existingNeighborhoods,
  existingCities,
}: Props) {
  const form = useAddressForm();
  const { organization } = useTenant();
  const router = useRouter();
  const { isSubmitting } = form.formState;
  const [uploadProgress, setUploadProgress] = useState(0);

  async function onSubmit(values: AddressFormData) {
    try {
      let imageUrl = values.image.imageUrl ?? null;
      let imageKey: string | null = null;

      if (values.image.imageFile instanceof File) {
        setUploadProgress(0);
        const uploaded = await uploadFile(
          values.image.imageFile,
          organization.slug,
          setUploadProgress,
        );
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
    } finally {
      setUploadProgress(0);
    }
  }

  const submitLabel = () => {
    if (uploadProgress > 0 && uploadProgress < 100)
      return `Enviando imagen ${uploadProgress}%`;
    if (isSubmitting) return "Creando…";
    return "Crear dirección";
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-8 pb-10"
      >
        <div className="px-1 pt-1">
          {/* ✅ repassa listas para AddressFields */}
          <AddressFields
            existingNeighborhoods={existingNeighborhoods}
            existingCities={existingCities}
          />
        </div>

        <div className="sticky bottom-0 z-10 border-t bg-background px-4 py-3 shadow-md">
          {uploadProgress > 0 && uploadProgress < 100 && (
            <progress
              value={uploadProgress}
              max={100}
              className="mb-2 w-full"
              aria-label={`Subiendo imagen: ${uploadProgress}%`}
            />
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>{submitLabel()}</span>
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
