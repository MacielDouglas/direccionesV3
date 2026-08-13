"use client";

import type { AddressType } from "@/features/addresses/types/address.types";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { Building2, Home, Hotel, Store, Utensils } from "lucide-react";

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
  const { t } = useI18n();

  const typeOptions: {
    value: AddressType;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { value: "House", label: t.admin.typeHouse, icon: <Home className="size-3.5" /> },
    {
      value: "Apartment",
      label: t.admin.typeApartment,
      icon: <Building2 className="size-3.5" />,
    },
    { value: "Store", label: t.admin.typeStore, icon: <Store className="size-3.5" /> },
    { value: "Hotel", label: t.admin.typeHotel, icon: <Hotel className="size-3.5" /> },
    {
      value: "Restaurant",
      label: t.admin.typeRestaurant,
      icon: <Utensils className="size-3.5" />,
    },
  ];

  const activeOptions: { value: boolean | undefined; label: string }[] = [
    { value: undefined, label: t.common.all },
    { value: true, label: t.addresses.active },
    { value: false, label: t.addresses.inactive },
  ];

  const toggleType = (type: AddressType) => {
    const current = filters.types ?? [];
    const next = current.includes(type) ? current.filter((t) => t !== type) : [...current, type];
    onChange({ ...filters, types: next });
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3">
      {/* Estado */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium w-10 shrink-0">
          {t.admin.filterStatus}
        </span>
        {activeOptions.map((opt) => (
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
          {t.admin.filterType}
        </span>
        {typeOptions.map((opt) => {
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
        {t.admin.addressCount.replace("{count}", String(total))}
      </p>
    </div>
  );
}
