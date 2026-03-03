"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Address } from "@prisma/client";
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

const ADDRESS_PLACEHOLDER = "/images/address-placeholder.jpg"; // ajuste para seu placeholder

function AddressTypeIcon({ type }: { type: string }) {
  const config = ADDRESS_TYPE_OPTIONS.find((t) => t.value === type);
  if (!config) return null;
  const Icon = config.icon;
  return (
    <span
      aria-label={`Tipo: ${config.label}`}
      // className="bg-black rounded-bl-xl "
    >
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
      aria-label="Status do endereço"
      className="flex flex-wrap gap-2"
    >
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          confirmed
            ? "bg-blue-100/20 text-blue-300"
            : "bg-red-100/20 text-red-400"
        }`}
      >
        {confirmed ? "✓ Confirmado" : "✗ No confirmado"}
      </span>
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
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
    <div className="w-full max-w-2xl mx-auto px-3 py-4 sm:px-4 sm:py-6 flex flex-col gap-5">
      {/* ── Search ── */}
      <section aria-label="Buscar endereços">
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
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none"
              aria-hidden="true"
            />
            <Input
              id="address-search"
              type="search"
              autoComplete="off"
              className="pl-9 rounded-xl border border-border bg-muted/40 focus-visible:ring-1 focus-visible:ring-orange-500"
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
          : "Nenhum endereço encontrado"}
      </p>

      {/* ── List ── */}
      {hasResults ? (
        <ul
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          aria-label="Lista de endereços"
        >
          {addresses.map((address) => {
            const label = `${address.businessName ?? address.street}, ${address.number} — ${address.neighborhood}, ${address.city}`;

            return (
              <li key={address.id}>
                <Link
                  href={`/org/${organizationSlug}/addresses/${address.id}`}
                  aria-label={`Ver detalhes: ${label}`}
                  className="group block rounded-2xl overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                >
                  <article className="relative w-full aspect-video bg-muted">
                    {/* Background Image */}
                    <Image
                      src={address.image ?? ADDRESS_PLACEHOLDER}
                      alt=""
                      aria-hidden="true"
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      priority={false}
                    />

                    {/* Dark overlay */}
                    <div
                      className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition-colors duration-300"
                      aria-hidden="true"
                    />

                    {/* Type icon — top right */}
                    <div className="absolute top-[3%] right-[3%] z-10">
                      <AddressTypeIcon type={address.type} />
                    </div>

                    {/* Content — bottom */}
                    <div className="absolute bottom-0 inset-x-0 z-10 bg-linear-to-t from-black/80 via-black/50 to-transparent px-3 pt-8 pb-3 flex flex-col gap-1.5">
                      {/* Name */}
                      {address.businessName && (
                        <p className="text-sm sm:text-base font-semibold text-white leading-tight tracking-wide truncate">
                          {address.businessName}
                        </p>
                      )}

                      {/* Street */}
                      <p className="text-xs sm:text-sm text-primary-lgt font-light flex items-center gap-1 truncate">
                        <MapPin
                          className="shrink-0 w-3.5 h-3.5"
                          aria-hidden="true"
                        />
                        {address.street}, {address.number} —{" "}
                        {address.neighborhood}, {address.city}
                      </p>

                      {/* Extra info */}
                      {address.info && (
                        <p className="text-xs text-white/60 truncate">
                          {address.info}
                        </p>
                      )}

                      {/* Status badges */}
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
          aria-label="Nenhum resultado"
          className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground"
        >
          <MapPin className="w-10 h-10 opacity-30" aria-hidden="true" />
          <p className="text-sm font-medium">
            Nenhum endereço encontrado
            {query ? ` para "${query}"` : ""}
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
              Limpar busca
            </Button>
          )}
        </section>
      )}
    </div>
  );
}

// Dentro de transportes / call center
