"use client";

import { useRef, useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import Image from "next/image";
import { Camera, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, FormItem } from "@/components/ui/form";
import type { AddressFormData } from "../../domain/address.schema";
import { getDefaultAddressImage } from "../../utils/getDefaultAddressImage";
import { useSmartImageUpload } from "../../hooks/useSmartImageUpload";

export default function AddressImageField() {
  const { watch, setValue, control } = useFormContext<AddressFormData>();

  const addressType = watch("addressType");
  const preview = watch("image.imageUrl");
  const isCustomImage = watch("image.isCustomImage");

  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null); // controla revoke
  const [dragActive, setDragActive] = useState(false);

  const { processImage, processingProgress, isProcessing, error } =
    useSmartImageUpload();

  // Atualiza imagem padrão quando muda o tipo (sem sobrescrever imagem customizada)
  useEffect(() => {
    if (isCustomImage) return;
    const defaultImage = getDefaultAddressImage(addressType);
    if (defaultImage) setValue("image.imageUrl", defaultImage);
  }, [addressType, isCustomImage, setValue]);

  // Limpa blob URL ao desmontar
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  async function handleFile(file?: File) {
    if (!file) return;

    // Preview imediato para UX responsiva
    const localUrl = URL.createObjectURL(file);
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = localUrl;
    setValue("image.imageUrl", localUrl);
    setValue("image.isCustomImage", true);

    // Processa (HEIC → compress → webp) sem fazer upload
    const processed = await processImage(file);
    if (!processed) {
      // processImage falhou — reverte para default
      handleRemove();
      return;
    }

    // Armazena o File processado para upload no submit
    setValue("image.imageFile", processed);
  }

  function handleRemove() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
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
                  // blob URLs não devem usar sizes otimizados
                  unoptimized={
                    preview.startsWith("blob:") || preview.startsWith("http") // R2, mapbox, qualquer CDN externo
                  }
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
                  role="status"
                  aria-label={`Procesando ${processingProgress}%`}
                  className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-black/60 p-4 text-white"
                >
                  <p className="text-sm font-medium">
                    Procesando {processingProgress}%
                  </p>
                  <progress
                    value={processingProgress}
                    max={100}
                    className="w-full"
                    aria-hidden="true"
                  />
                </div>
              )}

              {isCustomImage && !isProcessing && (
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

            {error && (
              <p role="alert" className="text-sm text-destructive mt-1">
                {error}
              </p>
            )}

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
