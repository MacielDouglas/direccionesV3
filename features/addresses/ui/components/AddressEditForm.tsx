"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useTenant } from "@/providers/TenantProvider";
import type { Address } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { updateAddressAction } from "../../application/address.actions";
import type { AddressFormData } from "../../domain/address.schema";
import { useAddressEditForm } from "../../hooks/useAddressEditForm";
import { deleteFile, uploadFile } from "../../utils/uploadFile";
import AddressFields from "./AddressFields";

interface Props {
  address: Address;
  existingNeighborhoods: string[]; // ✅
  existingCities: string[]; // ✅
}
// ✅ Extrai key da URL — type-safe, zero any
function extractKeyFromUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  const r2BaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";
  if (!r2BaseUrl || !imageUrl.startsWith(r2BaseUrl)) return null;
  return imageUrl.replace(`${r2BaseUrl}/`, "");
}

export default function AddressEditForm({ address, existingNeighborhoods, existingCities }: Props) {
  const form = useAddressEditForm(address);
  const { organization } = useTenant();
  const router = useRouter();
  const { isSubmitting } = form.formState;
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ Captura key da imagem ATUAL do banco na montagem (imutável)
  const oldImageKey = useMemo(() => extractKeyFromUrl(address.image), [address.image]);

  async function onSubmit(values: AddressFormData) {
    setIsSaving(true);

    try {
      const hasNewImageFile = values.image.imageFile instanceof File;
      let imageUrl = values.image.imageUrl ?? null;
      let imageKey = values.image.imageKey ?? null;

      // ✅ 1. DELETA IMAGEM ANTERIOR
      if (hasNewImageFile && oldImageKey) {
        try {
          await deleteFile(oldImageKey);
        } catch {
          // ⚠️ falha no delete não é crítica — banco/upload seguem
        }
      }

      // ✅ 2. UPLOAD NOVA IMAGEM
      if (hasNewImageFile) {
        setUploadProgress(0);
        const uploaded = await uploadFile(
          values.image.imageFile,
          organization.slug,
          setUploadProgress,
        );
        imageUrl = uploaded.publicUrl;
        imageKey = uploaded.key;
      }

      // ✅ 3. ATUALIZA BANCO
      await updateAddressAction(address.id, {
        ...values,
        businessName: values.addressType === "House" ? null : values.businessName,
        image: { imageUrl, imageKey, isCustomImage: !!imageKey },
      });

      toast.success("¡Dirección actualizada correctamente!");
      router.push(`/org/${organization.slug}/addresses/${address.id}`);
    } catch {
      toast.error("Error al actualizar la dirección. Intente nuevamente.");
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
    }
  }

  const submitLabel = () => {
    if (uploadProgress > 0 && uploadProgress < 100) return `Enviando imagen ${uploadProgress}%`;
    if (isSubmitting || isSaving) return "Guardando…";
    return "Guardar cambios";
  };

  if (isSaving) {
    return (
      <div className="flex flex-col items-center justify-center min-h-svh gap-6 px-6 py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-16 w-16 animate-spin text-brand" />
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-foreground">Guardando cambios...</p>
            <p className="text-base text-muted-foreground max-w-xs">
              Estamos procesando la imagen y guardando los datos. Esto puede tomar unos segundos.
            </p>
          </div>
        </div>

        {/* Skeleton cards */}
        <div className="w-full max-w-md space-y-3 mt-4">
          {[0, 1, 2, 3].map((card) => (
            <div key={card} className="h-12 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8 pb-10">
        <div className="px-1 pt-1">
          <AddressFields
            existingNeighborhoods={existingNeighborhoods}
            existingCities={existingCities}
          />
        </div>

        <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t bg-background px-4 py-3 shadow-md">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting || isSaving}
          >
            Cancelar
          </Button>

          <div className="flex flex-col items-end gap-1">
            {uploadProgress > 0 && uploadProgress < 100 && (
              <progress
                value={uploadProgress}
                max={100}
                className="w-32 h-2"
                aria-label={`Subiendo imagen: ${uploadProgress}%`}
              />
            )}
            <Button
              type="submit"
              disabled={isSubmitting || isSaving}
              aria-busy={isSubmitting || isSaving}
              className="min-w-32"
            >
              {isSubmitting || isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
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
