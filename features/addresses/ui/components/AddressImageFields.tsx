"use client";

import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import Image from "next/image";
import { Camera, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, FormItem } from "@/components/ui/form";
import type { AddressFormData } from "../../domain/address.schema";
import { getDefaultAddressImage } from "../../utils/getDefaultAddressImage";
import { useSmartImageUpload } from "../../hooks/useSmartImageUpload";
import { useTenant } from "@/providers/TenantProvider";

export default function AddressImageField() {
  const { watch, setValue, control } = useFormContext<AddressFormData>();
  const { organization } = useTenant();

  const addressType = watch("addressType");
  const preview = watch("image.imageUrl");
  const isCustomImage = watch("image.isCustomImage");

  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const {
    processAndUpload,
    cancelUpload,
    processingProgress,
    uploadProgress,
    isProcessing,
    isUploading,
  } = useSmartImageUpload();

  useEffect(() => {
    if (isCustomImage) return;
    const defaultImage = getDefaultAddressImage(addressType);
    if (defaultImage) setValue("image.imageUrl", defaultImage);
  }, [addressType, isCustomImage, setValue]);

  async function handleFile(file?: File) {
    if (!file) return;

    try {
      const localUrl = URL.createObjectURL(file);
      setValue("image.imageUrl", localUrl);
      setValue("image.isCustomImage", true);

      const uploadedUrl = await processAndUpload(file, organization.id);

      if (uploadedUrl) {
        URL.revokeObjectURL(localUrl);
        setValue("image.imageUrl", uploadedUrl);
      }
    } catch (err) {
      console.error("[AddressImageField] Error al procesar imagen:", err);
    }
  }

  function handleRemove() {
    cancelUpload();
    const defaultImage = getDefaultAddressImage(addressType);
    setValue("image.imageFile", undefined);
    setValue("image.imageUrl", defaultImage ?? undefined);
    setValue("image.isCustomImage", false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  return (
    <section className="space-y-4 border-b p-4">
      <header>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Camera className="h-6 w-6 text-brand" aria-hidden="true" />
          Imagen del lugar
        </h2>
        <p className="text-xs text-muted-foreground">
          Toca, arrastra o toma una foto.
        </p>
      </header>

      <FormField
        control={control}
        name="image.imageUrl"
        render={() => (
          <FormItem>
            <div
              role="button"
              tabIndex={0}
              aria-label="Seleccionar imagen"
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              className={`relative flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all
                ${dragActive ? "border-brand bg-brand/5" : "border-muted"}`}
            >
              {preview && (
                <Image
                  src={preview}
                  alt="Vista previa de la imagen seleccionada"
                  fill
                  className="object-cover"
                />
              )}

              {!preview && !isProcessing && (
                <div className="flex flex-col items-center text-muted-foreground">
                  <UploadCloud className="mb-2 h-8 w-8" aria-hidden="true" />
                  <span className="text-sm">Subir imagen</span>
                </div>
              )}

              {isProcessing && (
                <div
                  className="absolute inset-0 animate-pulse bg-muted"
                  aria-hidden="true"
                />
              )}

              {(isProcessing || isUploading) && (
                <div
                  role="status"
                  aria-label={
                    isProcessing
                      ? `Procesando ${processingProgress}%`
                      : `Enviando ${uploadProgress}%`
                  }
                  className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-black/60 p-4 text-white"
                >
                  <p className="text-sm font-medium">
                    {isProcessing
                      ? `Procesando ${processingProgress}%`
                      : `Enviando ${uploadProgress}%`}
                  </p>
                  <progress
                    value={isProcessing ? processingProgress : uploadProgress}
                    max={100}
                    className="w-full"
                    aria-hidden="true"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelUpload();
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              )}

              {isCustomImage && !isUploading && (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="absolute right-2 top-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                >
                  Quitar imagen
                </Button>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/*,.heic,.heif"
              className="sr-only"
              aria-hidden="true"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </FormItem>
        )}
      />
    </section>
  );
}
