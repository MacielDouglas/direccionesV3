"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AddressWithCard } from "@/features/addresses/application/address.service";
import type { AddressType } from "@/features/addresses/types/address.types";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { Layers, MapPin, MapPinned, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ADDRESS_TYPE_OPTIONS } from "../../domain/constants/address.constants";
import { AddressCard } from "../components/AddressCard";
import { AddressPagination } from "../components/AddressPagination";

const PAGE_SIZE_OPTIONS = [10, 30, 50, 70, 100] as const;

type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

const ACTIVE_OPTIONS = [undefined, true, false] as const;

type ActiveFilter = (typeof ACTIVE_OPTIONS)[number];

type Props = {
  addresses: AddressWithCard[];
  organizationSlug: string;
};

export default function AddressListScreen({ addresses, organizationSlug }: Props) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [activeFilter, setActive] = useState<ActiveFilter>(undefined);
  const [typeFilters, setTypes] = useState<AddressType[]>([]);
  const [withoutCardOnly, setWithoutCardOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);

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

  const handleWithoutCardToggle = () => {
    setWithoutCardOnly((prev) => !prev);
    resetPage();
  };

  const handlePageSizeChange = (size: PageSize) => {
    setPageSize(size);
    setPage(1);
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
      if (withoutCardOnly && a.cardId !== null && a.cardId !== undefined) return false;
      return true;
    });
  }, [addresses, query, activeFilter, typeFilters, withoutCardOnly]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const hasActiveFilters =
    query || activeFilter !== undefined || typeFilters.length > 0 || withoutCardOnly;

  return (
    <div className="flex flex-col gap-5">
      {/* Resumo — Saldo de endereços */}
      <section
        aria-label={t.addresses.heroLabel}
        className="rounded-2xl bg-black p-6 text-white shadow-xs shadow-black/20"
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
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground shadow-xs transition-colors hover:bg-brand/90 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <Plus className="size-4" aria-hidden="true" />
        {t.addresses.sendNew}
      </Link>

      {/* Busca + filtros */}
      <section aria-label={t.common.search} className="flex flex-col gap-3">
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

        {/* Filtros */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
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
                    "min-h-11 rounded-full border px-4 py-2 text-xs font-medium transition-colors",
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
                    "flex min-h-11 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium transition-colors",
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

          <div className="flex flex-wrap items-center gap-2">
            <span className="w-12 shrink-0 text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
              {t.addresses.cardFilter}
            </span>
            <button
              type="button"
              onClick={handleWithoutCardToggle}
              aria-pressed={withoutCardOnly}
              className={cn(
                "flex min-h-11 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium transition-colors",
                withoutCardOnly
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border text-muted-foreground hover:border-brand/50 hover:text-foreground",
              )}
            >
              <Layers className="size-3.5" aria-hidden />
              {t.addresses.withoutCard}
            </button>
          </div>
        </div>
      </section>

      {/* Contador + seletor de tamanho de página */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          className="text-sm font-medium tabular-nums text-muted-foreground"
          aria-live="polite"
          aria-atomic="true"
        >
          {filtered.length > 0
            ? t.addresses.resultCount.replace("{count}", String(filtered.length))
            : t.addresses.noResults}
        </p>

        <div className="flex items-center gap-2">
          <span className="shrink-0 text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
            {t.addresses.pageSizeLabel}
          </span>
          <fieldset
            className="flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-xs"
            aria-label={t.addresses.pageSizeLabel}
          >
            {PAGE_SIZE_OPTIONS.map((size) => {
              const isActive = pageSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handlePageSizeChange(size)}
                  aria-pressed={isActive}
                  aria-label={`${size} ${t.addresses.pageSizeLabel.toLowerCase()}`}
                  className={cn(
                    "min-h-11 min-w-11 rounded-full px-3 py-2 text-xs font-semibold tabular-nums transition-colors",
                    isActive
                      ? "bg-brand text-brand-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {size}
                </button>
              );
            })}
          </fieldset>
        </div>
      </div>

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
            pageSize={pageSize}
            onChange={setPage}
          />
        </>
      ) : (
        <section
          aria-label={t.addresses.noResults}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card px-4 py-10 text-center text-muted-foreground"
        >
          <MapPin className="size-8 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium">
            {t.addresses.noResults}
            {query ? ` "${query}"` : ""}
          </p>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={() => {
                setQuery("");
                setActive(undefined);
                setTypes([]);
                setWithoutCardOnly(false);
                setPage(1);
              }}
              className="min-h-11"
            >
              {t.addresses.clearFilters}
            </Button>
          )}
        </section>
      )}
    </div>
  );
}
