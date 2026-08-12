"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AddressType } from "@/features/addresses/types/address.types";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import type { Address } from "@prisma/client";
import { MapPin, MapPinned, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ADDRESS_TYPE_OPTIONS } from "../../domain/constants/address.constants";
import { AddressCard } from "../components/AddressCard";
import { AddressPagination } from "../components/AddressPagination";

const PAGE_SIZE = 10;

const ACTIVE_OPTIONS = [undefined, true, false] as const;

type ActiveFilter = (typeof ACTIVE_OPTIONS)[number];

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

  const total = addresses.length;
  const confirmedCount = useMemo(() => addresses.filter((a) => a.confirmed).length, [addresses]);
  const activeCount = useMemo(() => addresses.filter((a) => a.active).length, [addresses]);
  const pendingCount = useMemo(() => addresses.filter((a) => !a.confirmed).length, [addresses]);

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
    <div className="flex flex-col gap-5">
      {/* Resumo — Saldo de endereços */}
      <section
        aria-label={t.addresses.heroLabel}
        className="rounded-2xl bg-black p-6 text-white shadow-md shadow-black/20"
      >
        <span className="inline-flex items-center gap-2 text-[0.625rem] font-medium uppercase tracking-widest text-neutral-400">
          <MapPinned className="size-4 text-brand" aria-hidden="true" />
          {t.addresses.heroLabel}
        </span>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-5xl font-bold leading-none tabular-nums">{total}</span>
          <span className="text-sm font-medium text-neutral-300">
            {total === 1 ? t.addresses.heroUnitSingular : t.addresses.heroUnitPlural}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
            {t.addresses.heroConfirmed.replace("{count}", String(confirmedCount))}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden />
            {t.addresses.heroActive.replace("{count}", String(activeCount))}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-amber-400" aria-hidden />
            {t.addresses.heroPending.replace("{count}", String(pendingCount))}
          </span>
        </div>
      </section>

      <Link
        href={`/org/${organizationSlug}/addresses/new`}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground shadow-sm transition-colors hover:bg-brand/90 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <Plus className="size-4" aria-hidden="true" />
        {t.addresses.sendNew}
      </Link>

      {/* Busca */}
      <section aria-label={t.common.search}>
        <div className="relative">
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
        className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-12 shrink-0 text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
            {t.addresses.status}
          </span>
          {ACTIVE_OPTIONS.map((value) => {
            const isActive = activeFilter === value;
            const label =
              value === undefined
                ? t.common.all
                : value
                  ? t.addresses.active
                  : t.addresses.inactive;
            return (
              <button
                key={String(value)}
                type="button"
                onClick={() => handleActiveChange(value)}
                aria-pressed={isActive}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border text-muted-foreground hover:border-brand/50 hover:text-foreground",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="w-12 shrink-0 text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
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
      <p
        className="text-sm font-medium tabular-nums text-muted-foreground"
        aria-live="polite"
        aria-atomic="true"
      >
        {filtered.length > 0
          ? t.addresses.resultCount.replace("{count}", String(filtered.length))
          : t.addresses.noResults}
      </p>

      {/* Lista */}
      {paginated.length > 0 ? (
        <>
          <ul className="flex flex-col gap-3" aria-label={t.common.addresses}>
            {paginated.map((address) => (
              <li key={address.id}>
                <AddressCard address={address} organizationSlug={organizationSlug} />
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
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground"
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
