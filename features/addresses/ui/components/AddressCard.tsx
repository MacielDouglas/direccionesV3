import { cn } from "@/lib/utils";
import type { Address } from "@prisma/client";
import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AddressTypeIcon } from "./AddressTypeIcon";

const ADDRESS_PLACEHOLDER = "/images/address-placeholder.jpg";

function StatusBadge({
  active,
  confirmed,
}: {
  active: boolean;
  confirmed: boolean;
}) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Estado de la dirección">
      <li
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-semibold",
          confirmed
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
            : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
        )}
      >
        {confirmed ? "✓ Confirmada" : "✗ No confirmada"}
      </li>
      <li
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-semibold",
          active
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
            : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
        )}
      >
        {active ? "✓ Tarjeta activa" : "✗ Tarjeta desactivada"}
      </li>
    </ul>
  );
}

interface Props {
  address: Address;
  organizationSlug: string;
  priority?: boolean;
}

export function AddressCard({ address, organizationSlug, priority = false }: Props) {
  const label = `${address.businessName ?? address.street}, ${address.number} — ${address.neighborhood}, ${address.city}`;

  return (
    <Link
      href={`/org/${organizationSlug}/addresses/${address.id}`}
      aria-label={`Ver detalles: ${label}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <article className="relative aspect-video w-full bg-muted">
        <Image
          src={address.image ?? ADDRESS_PLACEHOLDER}
          alt=""
          aria-hidden
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority={priority}
        />

        <div
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5"
          aria-hidden
        />

        <div className="absolute right-3 top-3 z-10 rounded-xl bg-black/60 p-2 backdrop-blur-sm">
          <AddressTypeIcon type={address.type} />
        </div>

        {address.pendingDeletionAt && (
          <div className="absolute inset-x-0 bottom-1/2 z-20">
            <p className="bg-red-600/90 p-2 text-center text-xs font-semibold uppercase tracking-wide text-white">
              Borrar dirección. Confirmación pendiente.
            </p>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-1.5 px-4 pb-4 pt-8">
          {address.businessName && (
            <p className="truncate text-lg font-semibold leading-tight tracking-wide text-white sm:text-base">
              {address.businessName}
            </p>
          )}
          <p className="flex items-center gap-1 truncate text-base font-light text-white/90 sm:text-sm">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            {address.street}, {address.number} — {address.neighborhood}, {address.city}
          </p>
          {address.info && <p className="truncate text-xs text-white/70">{address.info}</p>}
          <StatusBadge active={address.active} confirmed={address.confirmed} />
        </div>
      </article>
    </Link>
  );
}
