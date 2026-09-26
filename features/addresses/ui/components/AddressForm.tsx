"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { I18nDictionary } from "@/lib/i18n/types";
import { useTenant } from "@/providers/TenantProvider";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { createAddressAction } from "../../application/address.actions";
import type { AddressFormData } from "../../domain/address.schema";
import { useAddressForm } from "../../hooks/useAddressForm";
import { uploadFile } from "../../utils/uploadFile";
import AddressCreateErrorDialog, { type AddressCreateErrorKind } from "./AddressCreateErrorDialog";
import AddressFields from "./AddressFields";

interface Props {
  existingNeighborhoods: string[];
  existingCities: string[];
}

type AddressKey = keyof I18nDictionary["addresses"];

// Mapeia campo com erro → label e mensagem traduzidos (pt/es)
const FIELD_ERRORS: Record<string, { labelKey: AddressKey; messageKey: AddressKey } | undefined> = {
  street: { labelKey: "formStreetLabel", messageKey: "errorStreet" },
  number: { labelKey: "formNumberLabel", messageKey: "errorNumber" },
  neighborhood: { labelKey: "formNeighborhoodLabel", messageKey: "errorNeighborhood" },
  city: { labelKey: "formCityLabel", messageKey: "errorCity" },
  info: { labelKey: "formInfoLabel", messageKey: "errorInfo" },
  latitude: { labelKey: "gpsTitle", messageKey: "errorGps" },
  longitude: { labelKey: "gpsTitle", messageKey: "errorGps" },
};

export default function AddressForm({ existingNeighborhoods, existingCities }: Props) {
  const form = useAddressForm();
  const { t } = useI18n();
  const { organization } = useTenant();
  const router = useRouter();
  const { isSubmitting } = form.formState;
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationOpen, setValidationOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ label: string; message: string }[]>(
    [],
  );
  const [createErrorOpen, setCreateErrorOpen] = useState(false);
  const [createErrorKind, setCreateErrorKind] = useState<AddressCreateErrorKind>("save");
  const [createErrorDetail, setCreateErrorDetail] = useState<string | null>(null);

  function classifyCreateError(message: string): AddressCreateErrorKind {
    const text = message.toLowerCase();
    if (
      text.includes("gps") ||
      text.includes("lat") ||
      text.includes("lng") ||
      text.includes("long") ||
      text.includes("coorden") ||
      text.includes("ubicac") ||
      text.includes("localiz")
    ) {
      return "gps";
    }
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
    if (
      text.includes("calle") ||
      text.includes("rua") ||
      text.includes("street") ||
      text.includes("número") ||
      text.includes("numero") ||
      text.includes("number") ||
      text.includes("barrio") ||
      text.includes("bairro") ||
      text.includes("neighborhood") ||
      text.includes("ciudad") ||
      text.includes("cidade") ||
      text.includes("city") ||
      text.includes("caracter") ||
      text.includes("obligatorio") ||
      text.includes("obrigat")
    ) {
      return "missing-info";
    }
    return "save";
  }

  function showCreateError(kind: AddressCreateErrorKind, detail?: string | null) {
    setCreateErrorKind(kind);
    setCreateErrorDetail(detail ?? null);
    setCreateErrorOpen(true);
  }

  async function onSubmit(values: AddressFormData) {
    try {
      let imageUrl = values.image.imageUrl ?? null;
      let imageKey: string | null = null;

      if (values.image.imageFile instanceof File) {
        try {
          setUploadProgress(0);
          const uploaded = await uploadFile(
            values.image.imageFile,
            organization.slug,
            setUploadProgress,
          );
          imageUrl = uploaded.publicUrl;
          imageKey = uploaded.key;
        } catch (uploadErr) {
          const detail = uploadErr instanceof Error ? uploadErr.message : null;
          showCreateError("image", detail);
          return;
        }
      }

      // Defesa extra: GPS ausente no momento do envio
      if (values.latitude == null || values.longitude == null) {
        showCreateError("gps", null);
        return;
      }

      const newAddress = await createAddressAction({
        ...values,
        businessName: values.addressType === "House" ? null : values.businessName,
        image: { imageUrl, imageKey, isCustomImage: true },
      });

      toast.success(t.addresses.addressCreated);
      router.push(`/org/${organization.slug}/addresses/${newAddress.id}`);
    } catch (err) {
      const detail = err instanceof Error ? err.message : null;
      showCreateError(detail ? classifyCreateError(detail) : "save", detail);
    } finally {
      setUploadProgress(0);
    }
  }

  // Envio bloqueado por validação → modal com o que falta e o erro
  function onInvalid(errors: FieldErrors<AddressFormData>) {
    const seen = new Set<AddressKey>();
    const items: { label: string; message: string }[] = [];

    for (const [field, _error] of Object.entries(errors)) {
      const entry = FIELD_ERRORS[field];
      if (!entry || seen.has(entry.messageKey)) continue;
      seen.add(entry.messageKey);
      items.push({
        label: t.addresses[entry.labelKey],
        message: t.addresses[entry.messageKey],
      });
    }

    if (items.length === 0) return;
    setValidationErrors(items);
    setValidationOpen(true);
  }

  const submitLabel = () => {
    if (uploadProgress > 0 && uploadProgress < 100)
      return t.addresses.imageUploading.replace("{percent}", String(uploadProgress));
    if (isSubmitting) return t.addresses.addressCreating;
    return t.addresses.createTitle;
  };

  function handleRetryCreate() {
    setCreateErrorOpen(false);
    form.handleSubmit(onSubmit, onInvalid)();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-8 pb-10">
        <AddressFields
          existingNeighborhoods={existingNeighborhoods}
          existingCities={existingCities}
        />

        <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-10 md:bottom-0">
          <div
            className="rounded-2xl border border-border bg-card p-4 shadow-lg"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
          >
            {uploadProgress > 0 && uploadProgress < 100 && (
              <progress
                value={uploadProgress}
                max={100}
                className="mb-2 w-full"
                aria-label={t.addresses.imageUploading.replace("{percent}", String(uploadProgress))}
              />
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="min-h-11 w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  <span>{submitLabel()}</span>
                </>
              ) : (
                t.addresses.createTitle
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Modal — endereço não validado */}
      <Dialog open={validationOpen} onOpenChange={setValidationOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">
          <DialogHeader className="text-left">
            <DialogTitle className="inline-flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
              {t.addresses.validateTitle}
            </DialogTitle>
            <DialogDescription>{t.addresses.validateDescription}</DialogDescription>
          </DialogHeader>

          <ul role="alert" className="flex flex-col gap-2">
            {validationErrors.map((item) => (
              <li
                key={item.label}
                className="flex items-start gap-2.5 rounded-xl bg-destructive/10 px-3 py-2.5"
              >
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0 text-destructive"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-sm text-destructive">{item.message}</p>
                </div>
              </li>
            ))}
          </ul>

          <DialogFooter>
            <Button
              type="button"
              onClick={() => setValidationOpen(false)}
              className="w-full sm:w-auto"
            >
              {t.addresses.validateDismiss}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal — falha ao criar endereço (GPS / foto / dados / servidor) */}
      <AddressCreateErrorDialog
        open={createErrorOpen}
        onOpenChange={setCreateErrorOpen}
        kind={createErrorKind}
        detail={createErrorDetail}
        onRetry={handleRetryCreate}
      />
    </Form>
  );
}
