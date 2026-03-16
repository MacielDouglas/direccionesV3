"use client";

import { useRef, useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import Image from "next/image";
import { Camera, UploadCloud, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, FormItem } from "@/components/ui/form";
import type { AddressFormData } from "../../domain/address.schema";
import { getDefaultAddressImage } from "../../utils/getDefaultAddressImage";
import { useSmartImageUpload } from "../../hooks/useSmartImageUpload";

// ✅ Converte File para base64 — sem risco de blob expirar
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AddressImageField() {
  const { watch, setValue, control } = useFormContext<AddressFormData>();

  const addressType = watch("addressType");
  const preview = watch("image.imageUrl");
  // const isCustomImage = watch("image.isCustomImage");

  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const { processImage, processingProgress, isProcessing, error } =
    useSmartImageUpload();

  // ✅ SÓ aplica default se não há imagem
  useEffect(() => {
    if (preview) return;
    const defaultImage = getDefaultAddressImage(addressType);
    if (defaultImage) setValue("image.imageUrl", defaultImage);
  }, [addressType, setValue, preview]);

  async function handleFile(file?: File) {
    if (!file) return;

    // ✅ Base64 como preview — nunca expira, sem blob
    const base64Url = await fileToBase64(file);
    setValue("image.imageUrl", base64Url);
    setValue("image.isCustomImage", true);
    setValue("image.imageKey", null);

    const processed = await processImage(file);
    if (!processed) {
      handleRemove();
      return;
    }

    setValue("image.imageFile", processed);
  }

  function handleRemove() {
    const defaultImage = getDefaultAddressImage(addressType);
    setValue("image.imageFile", undefined);
    setValue("image.imageUrl", defaultImage ?? undefined);
    setValue("image.imageKey", null);
    setValue("image.isCustomImage", false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  const isRemoteImage = preview?.startsWith("http");
  const isLocalPreview = preview?.startsWith("data:"); // base64

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
              className={`group relative flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all
                ${dragActive ? "border-brand bg-brand/5" : "border-muted"}`}
            >
              {/* Preview — http (banco) ou base64 (nova selecionada) */}
              {preview && (
                <Image
                  src={preview}
                  alt="Vista previa de la imagen seleccionada"
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}

              {/* Overlay — imagem do banco, aguardando troca */}
              {isRemoteImage && !isLocalPreview && !isProcessing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/30 transition-all group-hover:bg-black/50">
                  <Button
                    type="button"
                    size="lg"
                    className="gap-2 bg-white/95 text-black hover:bg-white shadow-xl font-semibold"
                    onClick={(e) => {
                      e.stopPropagation();
                      inputRef.current?.click();
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                    ¿Desea cambiar la imagen?
                  </Button>
                </div>
              )}

              {/* Área vazia */}
              {!preview && !isProcessing && (
                <div className="flex flex-col items-center text-muted-foreground">
                  <UploadCloud className="mb-2 h-8 w-8" aria-hidden="true" />
                  <span className="text-sm">Subir imagen</span>
                </div>
              )}

              {/* Processando */}
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

              {/* Remover — só após selecionar nova (base64) */}
              {isLocalPreview && !isProcessing && (
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
