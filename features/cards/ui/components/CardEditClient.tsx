"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MapPin, CheckCircle2 } from "lucide-react";

import { editCardSchema, type EditCardInput } from "../../domain/card.schema";
import { updateCardAction } from "../../application/card.actions";
import { Button } from "@/components/ui/button";
import { MapboxProvider } from "@/features/map/core/MapboxProvider";
import { SelectableAddressesLayer } from "@/features/map/layers/SelectableAddressesLayer";

type Address = {
  id: string;
  type: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  businessName: string | null;
  image: string | null;
  latitude: number | null;
  longitude: number | null;
};

interface Props {
  cardId: string;
  cardNumber: number;
  organizationId: string;
  organizationSlug: string;
  linkedAddresses: Address[]; // já vinculados ao card
  availableAddresses: Address[]; // livres para vincular
}

export function CardEditClient({
  cardId,
  cardNumber,
  organizationId,
  organizationSlug,
  linkedAddresses,
  availableAddresses,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<EditCardInput>({
    resolver: zodResolver(editCardSchema),
    defaultValues: {
      addressIds: linkedAddresses.map((a) => a.id),
    },
  });

  const selectedIds = useWatch({ control, name: "addressIds" });

  const toggle = (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((s) => s !== id)
      : [...selectedIds, id];
    setValue("addressIds", next, { shouldValidate: true });
  };

  // Todos os addresses para o mapa — linked + available com coords
  const allForMap = [...linkedAddresses, ...availableAddresses]
    .filter((a) => a.latitude != null && a.longitude != null)
    .map((a, i) => ({
      id: a.id,
      label: a.businessName ?? `${a.street}, ${a.number}`,
      latitude: a.latitude!,
      longitude: a.longitude!,
      index: i + 1,
    }));

  // Índice global para correlacionar lista ↔ mapa
  const indexMap = new Map(allForMap.map((a) => [a.id, a.index]));

  const onSubmit = (data: EditCardInput) => {
    startTransition(async () => {
      const result = await updateCardAction(
        cardId,
        organizationId,
        organizationSlug,
        data,
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(
        `Tarjeta #${String(cardNumber).padStart(2, "0")} actualizada.`,
      );
      router.push(`/org/${organizationSlug}/admin/cards`);
    });
  };

  return (
    <div className="flex flex-col h-dvh">
      {/* Mapa fixo no topo */}
      <div className="h-96 w-full overflow-hidden shadow-md">
        <MapboxProvider>
          <SelectableAddressesLayer
            addresses={allForMap}
            selectedIds={selectedIds}
            onToggle={toggle}
          />
        </MapboxProvider>
      </div>

      {/* Área rolável */}
      <div className="flex-1 overflow-y-auto">
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          aria-label="Formulario de edición de tarjeta"
          className="flex flex-col gap-5 px-4 py-4"
        >
          {/* Header */}
          <div className="rounded-lg border bg-muted/40 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Editando tarjeta
            </span>
            <span className="text-2xl font-bold tabular-nums">
              #{String(cardNumber).padStart(2, "0")}
            </span>
          </div>

          {/* Seção: vinculados */}
          <section aria-labelledby="linked-title">
            <h2
              id="linked-title"
              className="text-sm font-semibold mb-2 flex items-center gap-2"
            >
              Direcciones vinculadas
              <span className="text-xs font-normal text-muted-foreground">
                (
                {
                  linkedAddresses.filter((a) => selectedIds.includes(a.id))
                    .length
                }{" "}
                de {linkedAddresses.length})
              </span>
            </h2>
            <AddressList
              addresses={linkedAddresses}
              selectedIds={selectedIds}
              indexMap={indexMap}
              onToggle={toggle}
              emptyMessage="Sin direcciones vinculadas"
            />
          </section>

          {/* Seção: disponíveis */}
          {availableAddresses.length > 0 && (
            <section aria-labelledby="available-title">
              <h2
                id="available-title"
                className="text-sm font-semibold mb-2 flex items-center gap-2"
              >
                Direcciones disponibles
                <span className="text-xs font-normal text-muted-foreground">
                  (
                  {
                    availableAddresses.filter((a) => selectedIds.includes(a.id))
                      .length
                  }{" "}
                  seleccionadas)
                </span>
              </h2>
              <AddressList
                addresses={availableAddresses}
                selectedIds={selectedIds}
                indexMap={indexMap}
                onToggle={toggle}
                emptyMessage="No hay direcciones disponibles"
              />
            </section>
          )}

          {errors.addressIds && (
            <p role="alert" className="text-sm text-destructive">
              {errors.addressIds.message}
            </p>
          )}

          {/* Ações */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 pb-6">
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
              {isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componente auxiliar reutilizável
function AddressList({
  addresses,
  selectedIds,
  indexMap,
  onToggle,
  emptyMessage,
}: {
  addresses: Address[];
  selectedIds: string[];
  indexMap: Map<string, number>;
  onToggle: (id: string) => void;
  emptyMessage: string;
}) {
  if (addresses.length === 0) {
    return <p className="text-sm text-muted-foreground py-2">{emptyMessage}</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {addresses.map((addr) => {
        const isSelected = selectedIds.includes(addr.id);
        const index = indexMap.get(addr.id);

        return (
          <li key={addr.id}>
            <button
              type="button"
              onClick={() => onToggle(addr.id)}
              className={cn(
                "w-full text-left rounded-lg border p-3 transition-colors",
                "flex items-center gap-3",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                  : "border-border hover:border-red-300 hover:bg-muted/50",
              )}
            >
              {/* Número igual ao marker do mapa */}
              {index != null && (
                <span
                  className={cn(
                    "flex shrink-0 size-6 items-center justify-center rounded-full",
                    "text-xs font-bold text-white",
                    isSelected ? "bg-blue-500" : "bg-red-500",
                  )}
                  aria-hidden
                >
                  {index}
                </span>
              )}

              <span className="flex flex-col gap-0.5 min-w-0 flex-1">
                {addr.businessName && (
                  <span className="font-medium text-sm truncate">
                    {addr.businessName}
                  </span>
                )}
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="size-3 shrink-0" aria-hidden />
                  <span className="truncate">
                    {addr.street}, {addr.number} — {addr.neighborhood},{" "}
                    {addr.city}
                  </span>
                </span>
              </span>

              <CheckCircle2
                className={cn(
                  "ml-auto size-4 shrink-0 transition-colors",
                  isSelected ? "text-blue-500" : "text-muted-foreground/20",
                )}
                aria-hidden
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
