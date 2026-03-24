"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Address } from "@prisma/client";
import Link from "next/link";
import { useState, useMemo, useCallback } from "react";
import { Search, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADDRESS_TYPE_OPTIONS } from "../../domain/constants/address.constants";
import type { AddressType } from "@/features/addresses/types/address.types";
import { AddressCard } from "../components/AddressCard";
import { AddressPagination } from "../components/AddressPagination";

const PAGE_SIZE = 10;

const ACTIVE_OPTIONS = [
  { value: undefined, label: "Todos" },
  { value: true, label: "Activos" },
  { value: false, label: "Inactivos" },
] as const;

type ActiveFilter = (typeof ACTIVE_OPTIONS)[number]["value"];

type Props = {
  addresses: Address[];
  organizationSlug: string;
};

export default function AddressListScreen({
  addresses,
  organizationSlug,
}: Props) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActive] = useState<ActiveFilter>(undefined);
  const [typeFilters, setTypes] = useState<AddressType[]>([]);
  const [page, setPage] = useState(1);

  const resetPage = useCallback(() => setPage(1), []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    resetPage();
  };

  const handleActiveChange = (val: ActiveFilter) => {
    setActive(val);
    resetPage();
  };

  const toggleType = (type: AddressType) => {
    setTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
    resetPage();
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return addresses.filter((a) => {
      if (q) {
        const haystack = [
          a.street,
          a.number,
          a.neighborhood,
          a.city,
          a.businessName,
          a.info,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (activeFilter !== undefined && a.active !== activeFilter) return false;
      if (
        typeFilters.length > 0 &&
        !typeFilters.includes(a.type as AddressType)
      )
        return false;
      return true;
    });
  }, [addresses, query, activeFilter, typeFilters]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const hasActiveFilters =
    query || activeFilter !== undefined || typeFilters.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-3 py-4 sm:px-4 sm:py-6">
      <div>
        <Link
          href={`/org/${organizationSlug}/addresses/new`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-xs font-medium text-background transition-opacity hover:opacity-80"
        >
          + Enviar nueva dirección
        </Link>
      </div>

      {/* Busca */}
      <section aria-label="Buscar dirección">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            autoComplete="off"
            className="rounded-xl border border-border pl-9 focus-visible:ring-1"
            placeholder="Buscar por nombre, calle, barrio..."
            value={query}
            onChange={handleQueryChange}
            aria-label="Buscar dirección"
          />
        </div>
      </section>

      {/* Filtros */}
      <section
        aria-label="Filtros"
        className="flex flex-col gap-2 rounded-xl border bg-muted/30 p-3"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="w-10 shrink-0 text-xs font-medium text-muted-foreground">
            Estado
          </span>
          {ACTIVE_OPTIONS.map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => handleActiveChange(opt.value)}
              aria-pressed={activeFilter === opt.value}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                activeFilter === opt.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="w-10 shrink-0 text-xs font-medium text-muted-foreground">
            Tipo
          </span>
          {ADDRESS_TYPE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = typeFilters.includes(opt.value as AddressType);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleType(opt.value as AddressType)}
                aria-pressed={isSelected}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                <Icon className={cn("size-3.5", opt.color)} aria-hidden />
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Contador */}
      <p
        className="text-sm text-muted-foreground"
        aria-live="polite"
        aria-atomic="true"
      >
        {filtered.length > 0
          ? `${filtered.length} dirección${filtered.length !== 1 ? "es" : ""} encontrada${filtered.length !== 1 ? "s" : ""}`
          : "No se encontraron direcciones."}
      </p>

      {/* Lista */}
      {paginated.length > 0 ? (
        <>
          <ul
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            aria-label="Lista de direcciones"
          >
            {paginated.map((address, index) => (
              <li key={address.id}>
                <AddressCard
                  address={address}
                  organizationSlug={organizationSlug}
                  priority={index < 4}
                />
              </li>
            ))}
          </ul>
          <AddressPagination
            page={page}
            total={filtered.length}
            pageSize={PAGE_SIZE}
            onChange={setPage}
          />
        </>
      ) : (
        <section
          aria-label="Sin resultados"
          className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground"
        >
          <MapPin className="size-10 opacity-30" aria-hidden />
          <p className="text-sm font-medium">
            No se encontraron direcciones{query ? ` para "${query}"` : "."}
          </p>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("");
                setActive(undefined);
                setTypes([]);
                setPage(1);
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </section>
      )}
    </div>
  );
}
