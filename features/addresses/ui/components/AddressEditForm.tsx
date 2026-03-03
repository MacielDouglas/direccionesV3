"use client";

import { Address } from "@prisma/client";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTenant } from "@/providers/TenantProvider";
import { toast } from "sonner";

import AddressFields from "./AddressFields";
import { AddressFormData } from "../../domain/address.schema";
import { uploadAddressImage } from "../../application/address-image.service";
import { updateAddressAction } from "../../application/address.actions";
import { useAddressEditForm } from "../../hooks/useAddressEditForm";

type Props = {
  address: Address;
};

export default function AddressEditForm({ address }: Props) {
  const form = useAddressEditForm(address);
  const { organization } = useTenant();
  const router = useRouter();

  const { isSubmitting } = form.formState;

  async function onSubmit(values: AddressFormData) {
    try {
      let imageUrl = values.image.imageUrl ?? null;
      let imageKey = values.image.imageKey ?? null;

      if (values.addressType === "House") {
        values.businessName = null;
      }

      console.log("enviando formulário");

      // Só faz upload se for um novo arquivo
      if (values.image.imageFile instanceof File) {
        const uploaded = await uploadAddressImage(values.image.imageFile, {
          organizationId: organization.id,
        });
        imageUrl = uploaded.publicUrl;
        imageKey = uploaded.key;
      }

      await updateAddressAction(address.id, {
        ...values,
        image: {
          imageUrl,
          imageKey,
          isCustomImage: true,
        },
      });

      toast.success("Endereço atualizado com sucesso!");
      await router.push(`/org/${organization.slug}/addresses/${address.id}`);
    } catch (error) {
      toast.error(`Erro ao atualizar o endereço. Tente novamente. ${error}`);
    } finally {
      router.refresh();
    }
  }

  // href={`/org/${organizationSlug}/addresses/${addressId}`}

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-8 pb-10"
      >
        <div className="px-1 pt-1">
          <AddressFields control={form.control} />
        </div>

        {/* Footer fixo com ações */}
        <div className="sticky bottom-0 z-10 bg-background border-t px-4 py-3 flex items-center justify-between gap-3 shadow-md">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>

          <Button type="submit" disabled={isSubmitting} className="min-w-32">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              "Salvar alterações"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
