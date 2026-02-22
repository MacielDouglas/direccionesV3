"use client";

import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import Image from "next/image";
import { Camera, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, FormItem } from "@/components/ui/form";
import { AddressFormData } from "../../domain/address.schema";
import { getDefaultAddressImage } from "../../utils/getDefaultAddressImage";
import { useSmartImageUpload } from "../../hooks/useSmartImageUpload";

interface Props {
  organizationId: string;
}

export default function AddressImageField({ organizationId }: Props) {
  const { watch, setValue, control } = useFormContext<AddressFormData>();

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

  /* ------------------------------------------ */
  /* Default image por tipo                    */
  /* ------------------------------------------ */

  useEffect(() => {
    if (isCustomImage) return;

    const defaultImage = getDefaultAddressImage(addressType);
    if (defaultImage) {
      setValue("image.imageUrl", defaultImage);
    }
  }, [addressType, isCustomImage, setValue]);

  async function handleFile(file?: File) {
    if (!file) return;

    try {
      const localUrl = URL.createObjectURL(file);
      setValue("image.imageUrl", localUrl);
      setValue("image.isCustomImage", true);

      const uploadedUrl = await processAndUpload(file, organizationId);

      if (uploadedUrl) {
        URL.revokeObjectURL(localUrl);
        setValue("image.imageUrl", uploadedUrl);
      }
    } catch (err) {
      console.error(err);
    }
  }

  /* ------------------------------------------ */
  /* Remove image                              */
  /* ------------------------------------------ */

  function handleRemove() {
    cancelUpload();

    const defaultImage = getDefaultAddressImage(addressType);

    setValue("image.imageFile", undefined);
    setValue("image.imageUrl", defaultImage ?? undefined);
    setValue("image.isCustomImage", false);
  }

  /* ------------------------------------------ */
  /* Drag & Drop                               */
  /* ------------------------------------------ */

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  }

  return (
    <section className="space-y-4 border-b p-4">
      <header>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Camera className="text-orange-500 w-6 h-6" />
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
              onClick={() => inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              className={`relative w-full aspect-square rounded-2xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-center overflow-hidden
              ${
                dragActive ? "border-orange-500 bg-orange-50" : "border-muted"
              }`}
            >
              {/* ---------------- Preview ---------------- */}

              {preview && (
                <Image
                  src={preview}
                  alt="Imagen"
                  fill
                  className="object-cover"
                />
              )}

              {/* ---------------- Placeholder ------------- */}

              {!preview && !isProcessing && (
                <div className="flex flex-col items-center text-muted-foreground">
                  <UploadCloud className="w-8 h-8 mb-2" />
                  <span className="text-sm">Subir imagen</span>
                </div>
              )}

              {/* ---------------- Skeleton --------------- */}

              {isProcessing && (
                <div className="absolute inset-0 animate-pulse bg-muted" />
              )}

              {/* ---------------- Overlay Progress -------- */}

              {(isProcessing || isUploading) && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white space-y-3 p-4">
                  <p className="text-sm font-medium">
                    {isProcessing
                      ? `Procesando ${processingProgress}%`
                      : `Enviando ${uploadProgress}%`}
                  </p>

                  <progress
                    value={isProcessing ? processingProgress : uploadProgress}
                    max={100}
                    className="w-full"
                  />

                  <Button
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

              {/* ---------------- Remove Button ---------- */}

              {isCustomImage && !isUploading && (
                <Button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                >
                  Remover
                </Button>
              )}
            </div>

            {/* Hidden Input */}

            <input
              ref={inputRef}
              type="file"
              accept="image/*,.heic,.heif"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </FormItem>
        )}
      />
    </section>
  );
}
