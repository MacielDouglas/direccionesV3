"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import type { Address } from "@prisma/client";
import { Check, ChevronRight, MapPin, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AddressTypeIcon } from "./AddressTypeIcon";

const ADDRESS_PLACEHOLDER = "/images/address-placeholder.jpg";

const TYPE_TILE: Record<string, string> = {
  House: "bg-emerald-500/10",
  Apartment: "bg-pink-500/10",
  Store: "bg-amber-500/10",
  Hotel: "bg-blue-500/10",
  Restaurant: "bg-brand/10",
};

function StatusChip({
  ok,
  okLabel,
  notOkLabel,
}: {
  ok: boolean;
  okLabel: string;
  notOkLabel: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        ok
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
      )}
    >
      {ok ? <Check className="size-3" aria-hidden /> : <X className="size-3" aria-hidden />}
      {ok ? okLabel : notOkLabel}
    </span>
  );
}

interface Props {
  address: Address;
  organizationSlug: string;
}

export function AddressCard({ address, organizationSlug }: Props) {
  const { t } = useI18n();
  const label = `${address.businessName ?? address.street}, ${address.number} — ${address.neighborhood}, ${address.city}`;

  return (
    <Link
      href={`/org/${organizationSlug}/addresses/${address.id}`}
      aria-label={`${t.addresses.details}: ${label}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <Image
          src={address.image ?? ADDRESS_PLACEHOLDER}
          alt=""
          aria-hidden
          fill
          sizes="(max-width: 448px) 100vw, 448px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <article className="flex flex-col gap-3 p-4">
        <header className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={cn(
                "flex size-12 shrink-0 items-center justify-center rounded-xl",
                TYPE_TILE[address.type],
              )}
            >
              <AddressTypeIcon type={address.type} />
            </span>
            <div className="min-w-0">
              {address.businessName ? (
                <>
                  <h3 className="truncate text-base font-semibold leading-tight tracking-tight text-foreground">
                    {address.businessName}
                  </h3>
                  <p className="truncate text-sm text-muted-foreground">
                    {address.street}, {address.number}
                  </p>
                </>
              ) : (
                <h3 className="truncate text-base font-semibold leading-tight tracking-tight text-foreground">
                  {address.street}, {address.number}
                </h3>
              )}
            </div>
          </div>
          <ChevronRight
            className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </header>

        <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden />
          {address.neighborhood}, {address.city}
        </p>

        {address.info && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{address.info}</p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <StatusChip
            ok={address.confirmed}
            okLabel={t.addresses.confirmed}
            notOkLabel={t.addresses.notConfirmed}
          />
          <StatusChip
            ok={address.active}
            okLabel={t.addresses.cardActive}
            notOkLabel={t.addresses.cardInactive}
          />
          {address.pendingDeletionAt && (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-2.5 py-1 text-xs font-medium text-white">
              <Trash2 className="size-3" aria-hidden />
              {t.addresses.pendingDeletion}
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}
