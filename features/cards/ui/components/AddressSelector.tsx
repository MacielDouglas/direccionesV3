"use client";

import { MapPin, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AvailableAddress } from "../../types/card.types";
import { useMapInstance } from "@/features/map/core/MapboxProvider";

interface Props {
  addresses: AvailableAddress[];
  selected: string[];
  onChange: (ids: string[]) => void;
  error?: string;
}

export function AddressSelector({
  addresses,
  selected,
  onChange,
  error,
}: Props) {
  const { map } = useMapInstance();

  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id],
    );
  };

  const flyTo = (addr: AvailableAddress) => {
    if (!map || addr.latitude == null || addr.longitude == null) return;
    map.flyTo({
      center: [addr.longitude, addr.latitude],
      zoom: 16,
      essential: true,
    });
  };

  if (addresses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No hay direcciones disponibles.
      </p>
    );
  }

  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-medium mb-2">
        Direcciones{" "}
        <span className="text-muted-foreground font-normal">
          ({selected.length} seleccionada{selected.length !== 1 ? "s" : ""})
        </span>
      </legend>

      <ul
        role="listbox"
        aria-multiselectable="true"
        aria-label="Seleccionar direcciones"
        className="flex flex-col gap-2 min-w-0"
      >
        {addresses.map((addr, index) => {
          const isSelected = selected.includes(addr.id);
          const num = index + 1;

          return (
            <li
              key={addr.id}
              role="option"
              aria-selected={isSelected}
              className="min-w-0"
            >
              <button
                type="button"
                onClick={() => {
                  toggle(addr.id);
                  flyTo(addr);
                }}
                className={cn(
                  // w-full + min-w-0 + overflow-hidden impedem expansão horizontal
                  "w-full min-w-0 overflow-hidden",
                  "text-left rounded-lg border p-3 transition-colors",
                  "flex items-center gap-3",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isSelected
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                    : "border-border hover:border-red-300 hover:bg-muted/50",
                )}
              >
                {/* Número — igual ao marker do mapa */}
                <span
                  className={cn(
                    "flex shrink-0 size-6 items-center justify-center rounded-full",
                    "text-xs font-bold text-white",
                    isSelected ? "bg-blue-500" : "bg-red-500",
                  )}
                  aria-hidden="true"
                >
                  {num}
                </span>

                {/* Texto — min-w-0 + overflow-hidden para truncate funcionar */}
                <span className="flex flex-col gap-0.5 min-w-0 flex-1 overflow-hidden">
                  <span className="font-medium text-sm truncate">
                    {addr.businessName ?? "Casa"}
                  </span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1 min-w-0">
                    <MapPin className="size-3 shrink-0" aria-hidden />
                    <span className="truncate min-w-0">
                      {addr.street}, {addr.number} — {addr.neighborhood},{" "}
                      {addr.city}
                    </span>
                  </span>
                </span>

                <CheckCircle2
                  className={cn(
                    "shrink-0 size-4 transition-colors",
                    isSelected ? "text-blue-500" : "text-muted-foreground/20",
                  )}
                  aria-hidden
                />
              </button>
            </li>
          );
        })}
      </ul>

      {error && (
        <p role="alert" className="text-sm text-destructive mt-2">
          {error}
        </p>
      )}
    </fieldset>
  );
}
