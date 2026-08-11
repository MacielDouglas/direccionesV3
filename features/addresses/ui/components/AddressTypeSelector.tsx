"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MapPinHouse } from "lucide-react";
import { useController, useFormContext } from "react-hook-form";
import type { AddressFormData } from "../../domain/address.schema";
import { ADDRESS_TYPE_OPTIONS } from "../../domain/constants/address.constants";

export default function AddressTypeSelector() {
  const { control } = useFormContext<AddressFormData>();
  const {
    field: { value, onChange },
  } = useController({
    name: "addressType",
    control,
  });

  return (
    <section className="space-y-3 border-b pb-5">
      <header>
        <h2 className="inline-flex items-baseline gap-1 text-xl font-semibold">
          <MapPinHouse className="h-7 w-7 text-brand" aria-hidden="true" />
          Tipo de dirección
        </h2>
        <p className="text-sm text-muted-foreground">Selecciona el tipo de lugar</p>
      </header>

      <fieldset className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <legend className="sr-only">Tipo de dirección</legend>
        {ADDRESS_TYPE_OPTIONS.map((type) => {
          const isActive = value === type.value;
          const Icon = type.icon;

          return (
            <Button
              key={type.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(type.value)}
              className={cn(
                "rounded-xl border px-4 py-6 text-lg",
                "transition-all duration-150 active:scale-[0.97]",
                "focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none",
                isActive
                  ? "border-brand bg-brand text-brand-foreground shadow-md"
                  : "border-border bg-card text-card-foreground hover:bg-muted dark:bg-surface-elevated-dark",
              )}
            >
              <Icon width={20} height={20} aria-hidden="true" />
              <span className="font-medium">{type.label}</span>
            </Button>
          );
        })}
      </fieldset>
    </section>
  );
}
