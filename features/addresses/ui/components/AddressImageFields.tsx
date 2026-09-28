"use client";

import { Button } from "@/components/ui/button";
import { FormField, FormItem } from "@/components/ui/form";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Camera, RefreshCw, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { AddressFormData } from "../../domain/address.schema";
import { DEFAULT_ADDRESS_IMAGES } from "../../domain/constants/address.constants";
import { useSmartImageUpload } from "../../hooks/useSmartImageUpload";
import { getDefaultAddressImage } from "../../utils/getDefaultAddressImage";

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Previews locais (nunca enviados ao servidor). O valor do form só recebe a URL
// final após o processamento — data:/blob: no form significa "ainda processando".
export const isLocalPreview = (url?: string | null) =>
  !!url && (url.startsWith("data:") || url.startsWith("blob:"));

function revokeLocalPreview(url?: string | null) {
  if (url?.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // best-effort
    }
  }
}

const DEFAULT_URLS = new Set<string>(DEFAULT_ADDRESS_IMAGES.map((i) => i.url));
const isDefault = (url?: string | null) => !!url && DEFAULT_URLS.has(url);
const isBase64 = (url?: string | null) => !!url && url.startsWith("data:");
const isBlob = (url?: string | null) => !!url && url.startsWith("blob:");
const isRemote = (url?: string | null) => !!url && url.startsWith("http");

// ─── Component ───────────────────────────────────────────────────────────────

export default function AddressImageField() {
  const { t } = useI18n();
  const { watch, setValue, control } = useFormContext<AddressFormData>();

  const addressType = watch("addressType");
  const preview = watch("image.imageUrl");
  const isCustom = watch("image.isCustomImage");

  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const { processImage, processingProgress, isProcessing, errorCode } = useSmartImageUpload();

  const processError =
    errorCode === "too-large"
      ? t.addresses.imageTooLarge
      : errorCode === "invalid-file"
        ? t.addresses.imageInvalidFile
        : errorCode === "process-failed"
          ? t.addresses.imageProcessError
          : null;

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

    // Guarda a anterior: em falha, restaura em vez de descartar
    const previousUrl = watch("image.imageUrl");
    const previousFile = watch("image.imageFile");
    const previousKey = watch("image.imageKey");
    const wasCustom = watch("image.isCustomImage");

    // Preview imediato via object URL (leve — sem base64 gigante no estado do form,
    // o que estourava o limite do Server Action e a validação do servidor no iPhone)
    const pendingUrl = URL.createObjectURL(file);
    localPreviewRef.current = pendingUrl;
    setValue("image.imageUrl", pendingUrl);
    setValue("image.isCustomImage", true);
    setValue("image.imageKey", null);

    const processed = await processImage(file);
    if (!processed) {
      revokeLocalPreview(pendingUrl);
      localPreviewRef.current = previousUrl?.startsWith("blob:") ? previousUrl : null;
      setValue("image.imageUrl", previousUrl);
      setValue("image.imageFile", previousFile);
      setValue("image.imageKey", previousKey);
      setValue("image.isCustomImage", wasCustom);
      return;
    }
    // Troca o preview pendente pelo do arquivo final (processado)
    revokeLocalPreview(pendingUrl);
    const finalUrl = URL.createObjectURL(processed);
    revokeLocalPreview(previousUrl);
    localPreviewRef.current = finalUrl;
    setValue("image.imageUrl", finalUrl);
    setValue("image.imageFile", processed);
  }

  function handleRemove() {
    const current = watch("image.imageUrl");
    revokeLocalPreview(current);
    localPreviewRef.current = null;
    const def = getDefaultAddressImage(addressType);
    setValue("image.imageFile", undefined);
    setValue("image.imageUrl", def ?? undefined);
    setValue("image.imageKey", null);
    setValue("image.isCustomImage", false);
  }

  // Revoga object URLs ao desmontar para não vazar memória no mobile
  const localPreviewRef = useRef<string | null>(null);
  useEffect(() => {
    return () => {
      revokeLocalPreview(localPreviewRef.current);
    };
  }, []);

  // ─── Flags de estado visual ────────────────────────────────────────────────

  const hasImage = !!preview;
  const isCustomRemote = isRemote(preview) && !isDefault(preview);
  const canRemove = isBase64(preview) || isBlob(preview) || isCustomRemote;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <section className="space-y-3">
      <header>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Camera className="h-5 w-5 text-brand" aria-hidden />
          {t.addresses.imageTitle}
        </h2>
        <p className="text-xs text-muted-foreground">{t.addresses.imageHint}</p>
      </header>

      <FormField
        control={control}
        name="image.imageUrl"
        render={() => (
          <FormItem>
            <div className="relative">
              <button
                type="button"
                aria-label={t.addresses.imageSelectAria}
                onClick={() => inputRef.current?.click()}
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
                  "group relative flex aspect-square w-full cursor-pointer appearance-none items-center",
                  "justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all",
                  "bg-transparent p-0 text-left font-inherit text-foreground",
                  drag ? "border-brand bg-brand/5" : "border-muted",
                ].join(" ")}
              >
                {/* ── Imagem ── */}
                {hasImage && preview && (
                  <Image
                    src={preview}
                    alt={t.addresses.imagePreviewAlt}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )}

                {/* ── Estado vazio ── */}
                {!hasImage && !isProcessing && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <UploadCloud className="h-8 w-8" aria-hidden />
                    <span className="text-sm">{t.addresses.imageUpload}</span>
                  </div>
                )}

                {/* ── Overlay "Cambiar" — puramente visual, o clique abre o seletor ── */}
                {hasImage && !isProcessing && (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="inline-flex items-center gap-2 rounded-md bg-white/90 px-3 py-2 text-sm font-semibold text-black shadow-lg">
                      <RefreshCw className="h-4 w-4" aria-hidden />
                      {t.addresses.imageChange}
                    </span>
                  </span>
                )}

                {/* ── Processando ── */}
                {isProcessing && (
                  <output className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 p-6 text-white">
                    <p className="text-sm font-medium">
                      {t.addresses.imageProcessing.replace("{percent}", String(processingProgress))}
                    </p>
                    <progress
                      value={processingProgress}
                      max={100}
                      className="w-full"
                      aria-label={t.addresses.imageProcessing.replace(
                        "{percent}",
                        String(processingProgress),
                      )}
                    />
                  </output>
                )}
              </button>

              {/* ── Botão remover (canto) — fora do dropzone para evitar <button> aninhado ── */}
              {canRemove && !isProcessing && (
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute right-2 top-2 h-8 w-8 rounded-full shadow-lg"
                  onClick={handleRemove}
                  aria-label={t.addresses.imageRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {processError && (
              <p role="alert" className="mt-1 text-sm text-destructive">
                {processError}
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
