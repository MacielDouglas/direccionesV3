"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useTenant } from "@/providers/TenantProvider";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createAddressAction } from "../../application/address.actions";
import type { AddressFormData } from "../../domain/address.schema";
import { useAddressForm } from "../../hooks/useAddressForm";
import { uploadFile } from "../../utils/uploadFile";
import AddressFields from "./AddressFields";

interface Props {
  existingNeighborhoods: string[];
  existingCities: string[];
}

export default function AddressForm({ existingNeighborhoods, existingCities }: Props) {
  const form = useAddressForm();
  const { t } = useI18n();
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
        businessName: values.addressType === "House" ? null : values.businessName,
        image: { imageUrl, imageKey, isCustomImage: true },
      });

      toast.success(t.addresses.addressCreated);
      router.push(`/org/${organization.slug}/addresses/${newAddress.id}`);
    } catch {
      toast.error(t.addresses.addressCreateError);
    } finally {
      setUploadProgress(0);
    }
  }

  const submitLabel = () => {
    if (uploadProgress > 0 && uploadProgress < 100)
      return t.addresses.imageUploading.replace("{percent}", String(uploadProgress));
    if (isSubmitting) return t.addresses.addressCreating;
    return t.addresses.createTitle;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8 pb-10">
        <AddressFields
          existingNeighborhoods={existingNeighborhoods}
          existingCities={existingCities}
        />

        <div className="sticky bottom-0 z-10">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-lg">
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
              className="w-full"
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
    </Form>
  );
}
