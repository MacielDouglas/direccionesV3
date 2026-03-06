"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  createCardSchema,
  type CreateCardInput,
} from "../../domain/card.schema";
import { createCardAction } from "../../application/card.actions";
import { Button } from "@/components/ui/button";
import type { AvailableAddress } from "../../types/card.types";
import { AddressSelector } from "../AddressSelector";

interface Props {
  organizationId: string;
  organizationSlug: string;
  nextNumber: number;
  availableAddresses: AvailableAddress[];
}

export function CardForm({
  organizationId,
  organizationSlug,
  nextNumber,
  availableAddresses,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateCardInput>({
    resolver: zodResolver(createCardSchema),
    defaultValues: { addressIds: [] },
  });

  // useWatch é compatível com React Compiler — substitui watch()
  const selectedIds = useWatch({ control, name: "addressIds" });

  const onSubmit = (data: CreateCardInput) => {
    startTransition(async () => {
      const result = await createCardAction(
        organizationId,
        organizationSlug,
        data,
      );

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        `Tarjeta #${String(result.cardNumber).padStart(2, "0")} creada con éxito.`,
      );
      router.push(`/org/${organizationSlug}/admin/cards`);
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Formulario de creación de tarjeta"
      className="flex flex-col gap-6"
    >
      {/* Número de la próxima tarjeta */}
      <div className="rounded-lg border bg-muted/40 px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Próximo número</span>
        <span className="text-2xl font-bold tabular-nums">
          #{String(nextNumber).padStart(2, "0")}
        </span>
      </div>

      {/* Selección de direcciones */}
      <AddressSelector
        addresses={availableAddresses}
        selected={selectedIds}
        onChange={(ids) =>
          setValue("addressIds", ids, { shouldValidate: true })
        }
        error={errors.addressIds?.message}
      />

      {/* Acciones */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          disabled={isPending}
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="w-full sm:w-auto"
          disabled={isPending || selectedIds.length === 0}
          aria-busy={isPending}
        >
          {isPending
            ? "Creando..."
            : `Crear Tarjeta #${String(nextNumber).padStart(2, "0")}`}
        </Button>
      </div>
    </form>
  );
}
