"use client";

import { useRef, useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import Image from "next/image";
import { Camera, RefreshCw, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, FormItem } from "@/components/ui/form";
import type { AddressFormData } from "../../domain/address.schema";
import { getDefaultAddressImage } from "../../utils/getDefaultAddressImage";
import { useSmartImageUpload } from "../../hooks/useSmartImageUpload";
import { DEFAULT_ADDRESS_IMAGES } from "../../domain/constants/address.constants";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const DEFAULT_URLS = new Set<string>(DEFAULT_ADDRESS_IMAGES.map((i) => i.url));
const isDefault = (url?: string | null) => !!url && DEFAULT_URLS.has(url);
const isBase64 = (url?: string | null) => !!url && url.startsWith("data:");
const isRemote = (url?: string | null) => !!url && url.startsWith("http");

// ─── Component ───────────────────────────────────────────────────────────────

export default function AddressImageField() {
  const { watch, setValue, control } = useFormContext<AddressFormData>();

  const addressType = watch("addressType");
  const preview = watch("image.imageUrl");
  const isCustom = watch("image.isCustomImage");

  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const { processImage, processingProgress, isProcessing, error } =
    useSmartImageUpload();

  // Aplica imagem default quando não há customização
  useEffect(() => {
    if (isCustom === true) return;
    const def = getDefaultAddressImage(addressType);
    if (!def) return;
    if (!preview || isDefault(preview)) {
      setValue("image.imageUrl", def, { shouldDirty: false });
    }
  }, [addressType, isCustom, preview, setValue]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  async function handleFile(file?: File) {
    if (!file) return;

    // Preview imediato via base64
    setValue("image.imageUrl", await fileToBase64(file));
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
    const def = getDefaultAddressImage(addressType);
    setValue("image.imageFile", undefined);
    setValue("image.imageUrl", def ?? undefined);
    setValue("image.imageKey", null);
    setValue("image.isCustomImage", false);
  }

  // ─── Flags de estado visual ────────────────────────────────────────────────

  const hasImage = !!preview;
  const isCustomRemote = isRemote(preview) && !isDefault(preview);
  const canRemove = isBase64(preview) || isCustomRemote;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <section className="space-y-3 border-b p-4">
      <header>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Camera className="h-5 w-5 text-brand" aria-hidden />
          Imagen del lugar
        </h2>
        <p className="text-xs text-muted-foreground">
          Toca para seleccionar o arrastra una foto.
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
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              className={[
                "group relative flex aspect-square w-full cursor-pointer items-center",
                "justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all",
                drag ? "border-brand bg-brand/5" : "border-muted",
              ].join(" ")}
            >
              {/* ── Imagem ── */}
              {hasImage && (
                <Image
                  src={preview!}
                  alt="Vista previa"
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}

              {/* ── Estado vazio ── */}
              {!hasImage && !isProcessing && (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <UploadCloud className="h-8 w-8" aria-hidden />
                  <span className="text-sm">Subir imagen</span>
                </div>
              )}

              {/* ── Overlay "Cambiar" — sempre visível no mobile ── */}
              {hasImage && !isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Button
                    type="button"
                    size="default"
                    className="gap-2 bg-white/90 text-black shadow-lg hover:bg-white font-semibold"
                    onClick={(e) => {
                      e.stopPropagation();
                      inputRef.current?.click();
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                    ¿Cambiar imagen?
                  </Button>
                </div>
              )}

              {/* ── Botão remover (canto) — só para imagem customizada ── */}
              {canRemove && !isProcessing && (
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute right-2 top-2 h-8 w-8 rounded-full shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  aria-label="Quitar imagen"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              {/* ── Processando ── */}
              {isProcessing && (
                <div
                  role="status"
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 p-6 text-white"
                >
                  <p className="text-sm font-medium">
                    Procesando {processingProgress}%
                  </p>
                  <progress
                    value={processingProgress}
                    max={100}
                    className="w-full"
                    aria-label={`${processingProgress}%`}
                  />
                </div>
              )}
            </div>

            {error && (
              <p role="alert" className="mt-1 text-sm text-destructive">
                {error}
              </p>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/*,.heic,.heif"
              className="sr-only"
              aria-hidden
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </FormItem>
        )}
      />
    </section>
  );
}
