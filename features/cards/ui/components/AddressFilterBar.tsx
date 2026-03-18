"use client";

import { cn } from "@/lib/utils";
import { Home, Hotel, Store, Utensils, Building2 } from "lucide-react";
import type { AddressType } from "@/features/addresses/types/address.types";

const TYPE_OPTIONS: {
  value: AddressType;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "House", label: "Casa", icon: <Home className="size-3.5" /> },
  {
    value: "Apartment",
    label: "Apto",
    icon: <Building2 className="size-3.5" />,
  },
  { value: "Store", label: "Negocio", icon: <Store className="size-3.5" /> },
  { value: "Hotel", label: "Hotel", icon: <Hotel className="size-3.5" /> },
  {
    value: "Restaurant",
    label: "Restaurante",
    icon: <Utensils className="size-3.5" />,
  },
  // { value: "Clinic",     label: "Clínica",     icon: <Stethoscope   className="size-3.5" /> },
];

const ACTIVE_OPTIONS = [
  { value: undefined, label: "Todos" },
  { value: true, label: "Activos" },
  { value: false, label: "Inactivos" },
] as const;

export type AddressFilters = {
  active?: boolean;
  types?: AddressType[];
};

interface Props {
  filters: AddressFilters;
  onChange: (filters: AddressFilters) => void;
  total: number;
}

export function AddressFilterBar({ filters, onChange, total }: Props) {
  const toggleType = (type: AddressType) => {
    const current = filters.types ?? [];
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onChange({ ...filters, types: next });
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3">
      {/* Estado */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium w-10 shrink-0">
          Estado
        </span>
        {ACTIVE_OPTIONS.map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange({ ...filters, active: opt.value })}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
              filters.active === opt.value
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Tipo */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium w-10 shrink-0">
          Tipo
        </span>
        {TYPE_OPTIONS.map((opt) => {
          const isSelected = (filters.types ?? []).includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleType(opt.value)}
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              {opt.icon}
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Contador */}
      <p className="text-xs text-muted-foreground">
        {total} dirección{total !== 1 ? "es" : ""} encontrada
        {total !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
