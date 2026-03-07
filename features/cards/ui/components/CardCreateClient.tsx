"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  createCardSchema,
  type CreateCardInput,
} from "../../domain/card.schema";
import { createCardAction } from "../../application/card.actions";
import { Button } from "@/components/ui/button";
import type { AvailableAddress } from "../../types/card.types";
import { MapboxProvider } from "@/features/map/core/MapboxProvider";
import { SelectableAddressesLayer } from "@/features/map/layers/SelectableAddressesLayer";
import { AddressSelector } from "./AddressSelector";
import { sortAddressesByProximity } from "../../utils/sortAddressesByProximity";

interface Props {
  organizationId: string;
  organizationSlug: string;
  nextNumber: number;
  availableAddresses: AvailableAddress[];
}

export function CardCreateClient({
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

  const selectedIds = useWatch({ control, name: "addressIds" });

  const toggle = (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((s) => s !== id)
      : [...selectedIds, id];
    setValue("addressIds", next, { shouldValidate: true });
  };

  const sortedAddresses = sortAddressesByProximity(availableAddresses);

  const selectableAddresses = useMemo(
    () =>
      sortAddressesByProximity(availableAddresses).map((a, i) => ({
        id: a.id,
        label: a.businessName ?? `${a.street}, ${a.number}`,
        latitude: a.latitude!,
        longitude: a.longitude!,
        index: i + 1,
      })),
    [availableAddresses], // só recalcula se a lista mudar
  );

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
    // flex-1 ocupa o espaço disponível dentro do main
    // overflow-hidden no container pai para isolar o scroll interno
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Mapa fixo no topo */}
      <div className="h-96 w-full shrink-0 ">
        <MapboxProvider>
          <SelectableAddressesLayer
            addresses={selectableAddresses}
            selectedIds={selectedIds}
            onToggle={toggle}
          />
        </MapboxProvider>
      </div>

      {/* Área rolável — min-h-0 é essencial para flex + overflow no iOS */}
      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          aria-label="Formulario de creación de tarjeta"
          className="flex flex-col gap-4 px-4 py-4"
        >
          {/* Próximo número */}
          <div className="rounded-lg border bg-muted/40 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Crear tarjeta número:
            </span>
            <span className="text-2xl font-bold tabular-nums">
              #{String(nextNumber).padStart(2, "0")}
            </span>
          </div>

          {/* Lista de seleção */}

          <AddressSelector
            addresses={sortedAddresses} // ← ordenado
            selected={selectedIds}
            onChange={(ids) =>
              setValue("addressIds", ids, { shouldValidate: true })
            }
            error={errors.addressIds?.message}
          />

          {/* Ações */}
          <div
            className="flex flex-col-reverse gap-3 pt-2 sm:flex-row"
            style={{
              paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
            }}
          >
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
      </div>
    </div>
  );
}
