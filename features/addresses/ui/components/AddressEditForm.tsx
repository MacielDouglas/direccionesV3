"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useI18n } from "@/lib/i18n/I18nProvider";
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
import AddressCreateErrorDialog, { type AddressCreateErrorKind } from "./AddressCreateErrorDialog";
import AddressFields from "./AddressFields";
import { isLocalPreview } from "./AddressImageFields";

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
  const [updateErrorOpen, setUpdateErrorOpen] = useState(false);
  const [updateErrorKind, setUpdateErrorKind] = useState<AddressCreateErrorKind>("save");
  const [updateErrorDetail, setUpdateErrorDetail] = useState<string | null>(null);
  const { t } = useI18n();

  // ✅ Captura key da imagem ATUAL do banco na montagem (imutável)
  const oldImageKey = useMemo(() => extractKeyFromUrl(address.image), [address.image]);

  // Detalhe legível para o modal: JSON técnico (Zod/Prisma) e códigos
  // internos (UPLOAD_*) nunca são exibidos
  function humanErrorDetail(err: unknown): string | null {
    if (!(err instanceof Error)) return null;
    const message = err.message.trim();
    if (!message || message.length > 300 || /^[[{]/.test(message)) return null;
    if (/^[A-Z][A-Z0-9_]+$/.test(message)) return null;
    return message;
  }

  function classifyUpdateError(message: string): AddressCreateErrorKind {
    const text = message.toLowerCase();
    if (
      text.includes("foto") ||
      text.includes("photo") ||
      text.includes("imag") ||
      text.includes("upload") ||
      text.includes("firmada") ||
      text.includes("signed") ||
      text.includes("r2")
    ) {
      return "image";
    }
    return "save";
  }

  function showUpdateError(kind: AddressCreateErrorKind, detail?: string | null) {
    setUpdateErrorKind(kind);
    setUpdateErrorDetail(detail ?? null);
    setUpdateErrorOpen(true);
  }

  async function onSubmit(values: AddressFormData) {
    // Foto ainda processando (comum no iPhone) — o preview local nunca pode ir ao servidor.
    if (isLocalPreview(values.image.imageUrl) && !(values.image.imageFile instanceof File)) {
      showUpdateError("image", t.addresses.imageProcessing.replace("{percent}", "…"));
      return;
    }
    setIsSaving(true);

    let imageKey: string | null = null;
    try {
      const hasNewImageFile = values.image.imageFile instanceof File;
      let imageUrl = values.image.imageUrl ?? null;
      imageKey = values.image.imageKey ?? null;

      // ✅ 1. UPLOAD NOVA IMAGEM (antes de tocar na anterior)
      if (hasNewImageFile) {
        setUploadProgress(0);
        try {
          const uploaded = await uploadFile(
            values.image.imageFile,
            organization.slug,
            setUploadProgress,
          );
          imageUrl = uploaded.publicUrl;
          imageKey = uploaded.key;
        } catch (uploadErr) {
          showUpdateError("image", humanErrorDetail(uploadErr));
          return;
        }
      }

      // ✅ 2. ATUALIZA BANCO
      await updateAddressAction(address.id, {
        ...values,
        businessName: values.addressType === "House" ? null : values.businessName,
        image: { imageUrl, imageKey, isCustomImage: !!imageKey },
      });

      // ✅ 3. SÓ ENTÃO DELETA A ANTERIOR (banco já aponta para a nova)
      if (hasNewImageFile && oldImageKey && oldImageKey !== imageKey) {
        try {
          await deleteFile(oldImageKey);
        } catch {
          // ⚠️ falha no delete não é crítica — banco já está consistente
        }
      }

      toast.success(t.addresses.addressUpdated);
      router.push(`/org/${organization.slug}/addresses/${address.id}`);
    } catch (err) {
      // Upload ok mas atualização falhou → remove o objeto órfão do R2
      if (imageKey) {
        try {
          await deleteFile(imageKey);
        } catch {
          // limpeza best-effort
        }
      }
      const detail = humanErrorDetail(err);
      showUpdateError(detail ? classifyUpdateError(detail) : "save", detail);
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
    }
  }

  // Desabilita o salvar enquanto a foto está sendo processada (iPhone é lento aqui)
  const imagePreview = form.watch("image.imageUrl");
  const imageFile = form.watch("image.imageFile");
  const isImagePending = isLocalPreview(imagePreview) && !(imageFile instanceof File);
  const isBusy = isSubmitting || isSaving || isImagePending;

  const submitLabel = () => {
    if (uploadProgress > 0 && uploadProgress < 100)
      return t.addresses.savingImage.replace("{progress}", String(uploadProgress));
    if (isImagePending) return t.addresses.imageProcessing.replace("{percent}", "…");
    if (isSubmitting || isSaving) return t.addresses.savingTitle;
    return t.addresses.saveChangesButton;
  };

  function handleRetryUpdate() {
    setUpdateErrorOpen(false);
    form.handleSubmit(onSubmit)();
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

        <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-10 md:bottom-0">
          <div
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-lg"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting || isSaving}
              className="min-h-11 flex-1"
            >
              {t.common.cancel}
            </Button>

            <div className="flex flex-1 flex-col gap-1">
              {uploadProgress > 0 && uploadProgress < 100 && (
                <progress
                  value={uploadProgress}
                  max={100}
                  className="h-2 w-full"
                  aria-label={t.addresses.savingImage.replace("{progress}", String(uploadProgress))}
                />
              )}
              <Button
                type="submit"
                disabled={isBusy}
                aria-busy={isBusy}
                className="min-h-11 w-full"
              >
                {isBusy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>{submitLabel()}</span>
                  </>
                ) : (
                  t.addresses.saveChangesButton
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Modal — falha ao guardar (foto / upload / servidor) */}
      <AddressCreateErrorDialog
        open={updateErrorOpen}
        onOpenChange={setUpdateErrorOpen}
        kind={updateErrorKind}
        detail={updateErrorDetail}
        onRetry={handleRetryUpdate}
      />
    </Form>
  );
}
