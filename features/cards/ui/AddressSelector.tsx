"use client";

import { MapPin, CheckCircle2 } from "lucide-react";
import { AvailableAddress } from "../types/card.types";
import { cn } from "@/lib/utils";

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
  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id],
    );
  };

  if (addresses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Nenhum endereço disponível para este card.
      </p>
    );
  }

  return (
    <fieldset>
      <legend className="text-sm font-medium mb-2">
        Endereços{" "}
        <span className="text-muted-foreground font-normal">
          ({selected.length} selecionado{selected.length !== 1 ? "s" : ""})
        </span>
      </legend>

      <ul
        role="listbox"
        aria-multiselectable="true"
        aria-label="Selecione os endereços"
        className="flex flex-col gap-2"
      >
        {addresses.map((addr) => {
          const isSelected = selected.includes(addr.id);
          return (
            <li key={addr.id} role="option" aria-selected={isSelected}>
              <button
                type="button"
                onClick={() => toggle(addr.id)}
                className={cn(
                  "w-full text-left rounded-lg border p-3 transition-colors",
                  "flex items-start gap-3",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50",
                )}
              >
                <CheckCircle2
                  className={cn(
                    "mt-0.5 size-4 shrink-0 transition-colors",
                    isSelected ? "text-primary" : "text-muted-foreground/30",
                  )}
                  aria-hidden="true"
                />
                <span className="flex flex-col gap-0.5 min-w-0">
                  <span className="flex items-center gap-1.5 flex-wrap">
                    {addr.businessName && (
                      <span className="font-medium text-sm truncate">
                        {addr.businessName}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">
                      {addr.type}
                    </span>
                  </span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-3 shrink-0" aria-hidden="true" />
                    <span className="truncate">
                      {addr.street}, {addr.number} — {addr.neighborhood},{" "}
                      {addr.city}
                    </span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {error && (
        <p role="alert" className="text-sm text-destructive mt-1">
          {error}
        </p>
      )}
    </fieldset>
  );
}
