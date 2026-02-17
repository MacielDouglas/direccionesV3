"use client";

import { Button } from "@/components/ui/button";
import { ADDRESS_TYPE_OPTIONS } from "@/features/addresses/constants/address.constants";
import { AddressFormData } from "@/features/addresses/schemas/address.schema";
import { cn } from "@/lib/utils";
import { MapPinHouse } from "lucide-react";
import { useController, useFormContext } from "react-hook-form";

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
        <h2 className="text-xl font-semibold inline-flex gap-1 items-baseline">
          <MapPinHouse className="text-orange-500 w-7 h-7" /> Tipo de dirección
        </h2>
        <p className="text-sm text-muted-foreground">
          Selecciona el tipo de lugar
        </p>
      </header>

      <div role="radiogroup" className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {ADDRESS_TYPE_OPTIONS.map((type) => {
          const isActive = value === type.value;
          const Icon = type.icon;

          return (
            <Button
              key={type.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(type.value)}
              className={cn(
                "rounded-xl border px-4 py-6",
                "transition-all duration-150",
                "active:scale-[0.97]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 text-lg",
                isActive
                  ? "bg-orange-500 text-white border-orange-500 shadow-md"
                  : "bg-tertiary-lgt text-primary-drk hover:bg-muted border-border",
              )}
            >
              <Icon width={10} height={10} />
              <span className="font-medium">{type.label}</span>
            </Button>
          );
        })}
      </div>
    </section>
  );
}
