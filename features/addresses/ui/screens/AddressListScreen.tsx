"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Address } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { ADDRESS_TYPE_OPTIONS } from "../../domain/constants/address.constants";

type AddressListScreenProps = {
  addresses: Address[];
  organizationSlug: string;
  query?: string;
};

const ADDRESS_PLACEHOLDER = "/images/address-placeholder.jpg";

function AddressTypeIcon({ type }: { type: string }) {
  const config = ADDRESS_TYPE_OPTIONS.find((t) => t.value === type);
  if (!config) return null;
  const Icon = config.icon;
  return (
    <span aria-label={`Tipo: ${config.label}`}>
      <Icon className={config.color} size={28} aria-hidden="true" />
    </span>
  );
}

function StatusBadge({
  active,
  confirmed,
}: {
  active: boolean;
  confirmed: boolean;
}) {
  return (
    <div
      role="group"
      aria-label="Estado de la dirección"
      className="flex flex-wrap gap-2"
    >
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
          confirmed
            ? "bg-blue-100/20 text-blue-300"
            : "bg-red-100/20 text-red-400"
        }`}
      >
        {confirmed ? "✓ Confirmada" : "✗ No confirmada"}
      </span>
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
          active ? "bg-blue-100/20 text-blue-300" : "bg-red-100/20 text-red-400"
        }`}
      >
        {active ? "✓ Tarjeta activa" : "✗ Tarjeta desactivada"}
      </span>
    </div>
  );
}

export default function AddressListScreen({
  addresses,
  organizationSlug,
  query,
}: AddressListScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(query ?? "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }
    router.push(`/org/${organizationSlug}/addresses?${params.toString()}`);
  }

  const hasResults = addresses.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-3 py-4 sm:px-4 sm:py-6">
      {/* ── Search ── */}
      <section aria-label="Buscar dirección">
        <form
          onSubmit={handleSearch}
          role="search"
          className="flex items-center gap-2"
        >
          <label htmlFor="address-search" className="sr-only">
            Buscar dirección
          </label>
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="address-search"
              type="search"
              autoComplete="off"
              className="rounded-xl border border-border pl-9 focus-visible:ring-1 focus-visible:ring-brand"
              placeholder="Buscar dirección..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <Button type="submit" className="shrink-0">
            Buscar
          </Button>
        </form>
      </section>

      {/* ── Count ── */}
      <p
        className="text-sm text-muted-foreground"
        aria-live="polite"
        aria-atomic="true"
      >
        {hasResults
          ? `${addresses.length} dirección${addresses.length !== 1 ? "es" : ""} encontrada${addresses.length !== 1 ? "s" : ""}`
          : "No se encontraron direcciones."}
      </p>

      {/* ── List ── */}
      {hasResults ? (
        <ul
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          aria-label="Lista de direcciones"
        >
          {addresses.map((address) => {
            const label = `${address.businessName ?? address.street}, ${address.number} — ${address.neighborhood}, ${address.city}`;

            return (
              <li key={address.id}>
                <Link
                  href={`/org/${organizationSlug}/addresses/${address.id}`}
                  aria-label={`Ver detalles: ${label}`}
                  className="group block overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <article className="relative aspect-video w-full bg-muted">
                    <Image
                      src={address.image ?? ADDRESS_PLACEHOLDER}
                      alt=""
                      aria-hidden="true"
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      priority={false}
                    />

                    <div
                      className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/55"
                      aria-hidden="true"
                    />

                    {/* Type icon — top right */}
                    <div className="absolute right-0 top-0 z-10 rounded-bl-xl bg-black/70 p-2">
                      <AddressTypeIcon type={address.type} />
                    </div>

                    {/* Content — bottom */}
                    <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-1.5 bg-liner-to-t from-black/80 via-black/50 to-transparent px-3 pb-3 pt-1">
                      {address.businessName && (
                        <p className="truncate text-lg font-semibold leading-tight tracking-wide text-white sm:text-base">
                          {address.businessName}
                        </p>
                      )}

                      <p className="flex items-center gap-1 truncate text-base font-light text-white/80 sm:text-sm">
                        <MapPin
                          className="h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        {address.street}, {address.number} —{" "}
                        {address.neighborhood}, {address.city}
                      </p>

                      {address.info && (
                        <p className="truncate text-xs text-white/60">
                          {address.info}
                        </p>
                      )}

                      <StatusBadge
                        active={address.active}
                        confirmed={address.confirmed}
                      />
                    </div>
                  </article>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        /* ── Empty state ── */
        <section
          aria-label="Sin resultados"
          className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground"
        >
          <MapPin className="h-10 w-10 opacity-30" aria-hidden="true" />
          <p className="text-sm font-medium">
            No se encontraron direcciones{query ? ` para "${query}"` : "."}
          </p>
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setValue("");
                router.push(`/org/${organizationSlug}/addresses`);
              }}
            >
              Limpiar búsqueda
            </Button>
          )}
        </section>
      )}
    </div>
  );
}
