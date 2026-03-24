import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Address } from "@prisma/client";
import { AddressTypeIcon } from "./AddressTypeIcon";
// import { AddressTypeIcon } from "./AddressTypeIcon";

const ADDRESS_PLACEHOLDER = "/images/address-placeholder.jpg";

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
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-semibold",
          confirmed
            ? "bg-blue-100/20 text-blue-300"
            : "bg-red-100/20 text-red-400",
        )}
      >
        {confirmed ? "✓ Confirmada" : "✗ No confirmada"}
      </span>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-semibold",
          active
            ? "bg-blue-100/20 text-blue-300"
            : "bg-red-100/20 text-red-400",
        )}
      >
        {active ? "✓ Tarjeta activa" : "✗ Tarjeta desactivada"}
      </span>
    </div>
  );
}

interface Props {
  address: Address;
  organizationSlug: string;
  priority?: boolean;
}

export function AddressCard({
  address,
  organizationSlug,
  priority = false,
}: Props) {
  const label = `${address.businessName ?? address.street}, ${address.number} — ${address.neighborhood}, ${address.city}`;

  return (
    <Link
      href={`/org/${organizationSlug}/addresses/${address.id}`}
      aria-label={`Ver detalles: ${label}`}
      className="group block overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
          className="absolute inset-0 bg-black/30 transition-colors duration-300 group-hover:bg-black/55"
          aria-hidden
        />

        <div className="absolute right-0 top-0 z-10 rounded-bl-xl bg-black/70 p-2">
          <AddressTypeIcon type={address.type} />
        </div>

        {address.pendingDeletionAt && (
          <div className="absolute inset-x-0 bottom-[50%] z-20">
            <p className="bg-black/60 p-2 text-center uppercase text-red-500">
              Borrar dirección. Confirmación pendiente.
            </p>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-1.5 bg-linear-to-t from-black/80 via-black/50 to-black/10 px-3 pb-3 pt-1">
          {address.businessName && (
            <p className="truncate text-lg font-semibold leading-tight tracking-wide text-white sm:text-base">
              {address.businessName}
            </p>
          )}
          <p className="flex items-center gap-1 truncate text-base font-light text-white/80 sm:text-sm">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            {address.street}, {address.number} — {address.neighborhood},{" "}
            {address.city}
          </p>
          {address.info && (
            <p className="truncate text-xs text-white/60">{address.info}</p>
          )}
          <StatusBadge active={address.active} confirmed={address.confirmed} />
        </div>
      </article>
    </Link>
  );
}
