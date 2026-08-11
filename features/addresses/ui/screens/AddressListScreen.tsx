"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AddressType } from "@/features/addresses/types/address.types";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import type { Address } from "@prisma/client";
import { MapPin, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ADDRESS_TYPE_OPTIONS } from "../../domain/constants/address.constants";
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

export default function AddressListScreen({ addresses, organizationSlug }: Props) {
  const { t } = useI18n();
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
    setTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
    resetPage();
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return addresses.filter((a) => {
      if (q) {
        const haystack = [a.street, a.number, a.neighborhood, a.city, a.businessName, a.info]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (activeFilter !== undefined && a.active !== activeFilter) return false;
      if (typeFilters.length > 0 && !typeFilters.includes(a.type as AddressType)) return false;
      return true;
    });
  }, [addresses, query, activeFilter, typeFilters]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const hasActiveFilters = query || activeFilter !== undefined || typeFilters.length > 0;

  return (
    <div className="mx-auto flex w-full flex-col gap-6 px-4 py-6 sm:px-6 md:py-10">
      <div>
        <Link
          href={`/org/${organizationSlug}/addresses/new`}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-sm transition-colors hover:bg-brand/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <Plus className="size-4" aria-hidden="true" />
          {t.addresses.sendNew}
        </Link>
      </div>

      {/* Busca */}
      <section aria-label={t.common.search}>
        <div className="relative max-w-2xl">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            autoComplete="off"
            className="h-12 rounded-2xl border-border bg-card pl-10 shadow-xs focus-visible:ring-2"
            placeholder={t.addresses.searchPlaceholder}
            value={query}
            onChange={handleQueryChange}
            aria-label={t.addresses.searchPlaceholder}
          />
        </div>
      </section>

      {/* Filtros */}
      <section
        aria-label={t.addresses.status}
        className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 w-full max-w-2xl shadow-xs"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-12 shrink-0 text-xs font-medium text-muted-foreground">
            {t.addresses.status}
          </span>
          {ACTIVE_OPTIONS.map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => handleActiveChange(opt.value)}
              aria-pressed={activeFilter === opt.value}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                activeFilter === opt.value
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border text-muted-foreground hover:border-brand/50 hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="w-12 shrink-0 text-xs font-medium text-muted-foreground">
            {t.addresses.type}
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
                  "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                  isSelected
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border text-muted-foreground hover:border-brand/50 hover:text-foreground",
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
      <p className="text-sm text-muted-foreground" aria-live="polite" aria-atomic="true">
        {filtered.length > 0
          ? `${filtered.length} dirección${filtered.length !== 1 ? "es" : ""} encontrada${filtered.length !== 1 ? "s" : ""}`
          : t.addresses.noResults}
      </p>

      {/* Lista */}
      {paginated.length > 0 ? (
        <>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label={t.common.addresses}>
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
          aria-label={t.addresses.noResults}
          className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground"
        >
          <MapPin className="size-10 opacity-30" aria-hidden />
          <p className="text-sm font-medium">
            {t.addresses.noResults}
            {query ? ` "${query}"` : ""}
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
              {t.addresses.clearFilters}
            </Button>
          )}
        </section>
      )}
    </div>
  );
}
