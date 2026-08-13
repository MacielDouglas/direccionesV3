"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ADDRESS_TYPE_OPTIONS } from "@/features/addresses/domain/constants/address.constants";
import type { AddressWithUsers } from "@/features/addresses/types/address.types";
import { AddressImageViewer } from "@/features/addresses/ui/components/AddressImageViewer";
import DeleteAddressButton from "@/features/addresses/ui/components/DeleteAddressButton";
import { NavigateAddressButtons } from "@/features/addresses/ui/components/NavigateAddressButtons";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { CircleAlert, Map as MapIcon, MapPin, Pencil, X } from "lucide-react";
import Link from "next/link";
import { Suspense, use, useState } from "react";
import { AddressMapModal } from "./AddressMapModal";

const TYPE_TILE: Record<string, string> = {
  House: "bg-emerald-500/10",
  Apartment: "bg-pink-500/10",
  Store: "bg-amber-500/10",
  Hotel: "bg-blue-500/10",
  Restaurant: "bg-brand/10",
};

function typeTileOf(type: string): string {
  return TYPE_TILE[type] ?? "bg-muted";
}

function formatDate(date: Date | string, locale: string) {
  return new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "es-419", {
    timeZone: "America/Bogota",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

interface Props {
  promise: Promise<AddressWithUsers | null> | null;
  organizationSlug: string;
  onClose: () => void;
}

export function AddressDetailModal({ promise, onClose, organizationSlug }: Props) {
  const { t } = useI18n();

  return (
    <Dialog
      open={!!promise}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      {/* Sheet mobile / diálogo central desktop */}
      <DialogContent
        showCloseButton={false}
        className={cn(
          "fixed z-50 gap-0",
          "max-h-[92dvh] w-full max-w-full overflow-y-auto p-0",
          "left-0! right-0! bottom-0! top-auto! rounded-t-3xl! border-0!",
          "translate-x-0! translate-y-0!",
          "sm:left-1/2! sm:right-auto! sm:top-1/2! sm:bottom-auto! sm:-translate-x-1/2! sm:-translate-y-1/2!",
          "sm:max-w-2xl! sm:rounded-3xl! sm:border! sm:max-h-[90dvh]",
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{t.admin.addressDetailTitle}</DialogTitle>
          <DialogDescription>{t.admin.addressDetailDescription}</DialogDescription>
        </DialogHeader>

        {promise && (
          <Suspense fallback={<AddressDetailSkeleton />}>
            <AddressContent
              promise={promise}
              organizationSlug={organizationSlug}
              onClose={onClose}
            />
          </Suspense>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function AddressDetailSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-card/95 p-3 backdrop-blur">
        <Skeleton className="h-11 w-28 rounded-full" />
        <Skeleton className="size-11 rounded-full" />
      </div>
      <section className="flex flex-col gap-4 border-t border-border bg-card p-4 pb-8 sm:p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-xl" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3.5 w-28" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-4 rounded-xl border p-4">
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="flex flex-col gap-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </section>
    </div>
  );
}

// ─── Content ─────────────────────────────────────────────────────────────────

function AddressContent({
  promise,
  organizationSlug,
  onClose,
}: {
  promise: Promise<AddressWithUsers | null>;
  organizationSlug: string;
  onClose: () => void;
}) {
  const { t, locale } = useI18n();
  const address = use(promise);
  const [mapOpen, setMapOpen] = useState(false);

  if (!address)
    return (
      <div className="flex items-center justify-center px-4 py-16 text-center text-sm text-destructive">
        {t.addresses.notFound}
      </div>
    );

  const typeConfig = ADDRESS_TYPE_OPTIONS.find((opt) => opt.value === address.type);
  const Icon = typeConfig?.icon;
  const fullAddress = `${address.street}, ${address.number} · ${address.neighborhood}, ${address.city}`;
  const hasCoordinates = address.latitude != null && address.longitude != null;

  return (
    <article className="flex flex-col">
      {/* Topo fixo: ver mapa + navegação + fechar */}
      <div className="sticky top-0 z-20 border-b border-border/60 bg-card/95 backdrop-blur">
        <div className="flex items-center justify-between gap-3 p-3">
          {hasCoordinates ? (
            <button
              type="button"
              onClick={() => setMapOpen(true)}
              className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <MapIcon className="size-4 text-brand" aria-hidden />
              {t.cards.seeMap}
            </button>
          ) : (
            <span aria-hidden />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        {hasCoordinates && (
          <div className="px-3 pb-3">
            <NavigateAddressButtons
              latitude={Number(address.latitude)}
              longitude={Number(address.longitude)}
            />
          </div>
        )}
      </div>

      {/* Detalhes */}
      <section
        aria-label={t.admin.addressDetailTitle}
        className="flex flex-col gap-5 border-t border-border bg-card p-4 pb-8 sm:p-6"
      >
        {/* Cabeçalho: tipo + nome */}
        <header className="flex items-center gap-3">
          <span
            className={cn(
              "grid size-12 shrink-0 place-items-center rounded-xl",
              typeTileOf(address.type),
            )}
            aria-hidden
          >
            {Icon && <Icon className={typeConfig?.color} size={22} />}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold tracking-tight text-foreground">
              {address.businessName ?? `${address.street}, ${address.number}`}
            </h2>
            {address.businessName && (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {address.street}, {address.number}
              </p>
            )}
          </div>
        </header>

        {/* Estado */}
        <ul className="flex flex-wrap gap-2" aria-label={t.addresses.statusAria}>
          <li
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              address.confirmed
                ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
            )}
          >
            {address.confirmed ? `✓ ${t.addresses.confirmed}` : `✗ ${t.addresses.notConfirmed}`}
          </li>
          <li
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              address.active
                ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
            )}
          >
            {address.active ? `✓ ${t.addresses.activeBadge}` : `✗ ${t.addresses.inactiveBadge}`}
          </li>
          {address.pendingDeletionAt && (
            <li className="inline-flex items-center gap-1 rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-white">
              {t.addresses.pendingDeletion}
            </li>
          )}
        </ul>

        {/* Informação de localização */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-xl border border-border bg-muted/40 p-4">
          <div>
            <dt className="text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
              {t.addresses.streetField}
            </dt>
            <dd className="mt-0.5 break-words text-sm font-medium text-foreground">
              {address.street}, {address.number}
            </dd>
          </div>
          <div>
            <dt className="text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
              {t.addresses.neighborhoodField}
            </dt>
            <dd className="mt-0.5 break-words text-sm font-medium text-foreground">
              {address.neighborhood}
            </dd>
          </div>
          <div>
            <dt className="text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
              {t.addresses.cityField}
            </dt>
            <dd className="mt-0.5 break-words text-sm font-medium text-foreground">
              {address.city}
            </dd>
          </div>
          <div>
            <dt className="text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
              {t.addresses.type}
            </dt>
            <dd className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
              {Icon && <Icon className={cn("size-4", typeConfig?.color)} aria-hidden />}
              {typeConfig?.label ?? address.type}
            </dd>
          </div>
          {address.businessName && (
            <div className="col-span-2">
              <dt className="text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
                {t.addresses.businessField}
              </dt>
              <dd className="mt-0.5 break-words text-sm font-medium text-foreground">
                {address.businessName}
              </dd>
            </div>
          )}
        </dl>

        <p className="flex items-start gap-1.5 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
          <MapPin className="mt-px size-3.5 shrink-0 text-brand" aria-hidden />
          {fullAddress}
        </p>

        {!address.active && (
          <p className="inline-flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {t.addresses.inactiveWarning}
          </p>
        )}

        {/* Informação adicional */}
        {address.info && (
          <section className="rounded-xl bg-muted p-4">
            <h3 className="mb-1.5 text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
              {t.addresses.additionalInfo}
            </h3>
            <p className="text-sm leading-relaxed text-foreground/80">{address.info}</p>
          </section>
        )}

        {/* Imagem */}
        {address.image && (
          <figure className="w-full overflow-hidden rounded-xl">
            <AddressImageViewer
              src={address.image}
              alt={address.businessName ?? t.addresses.streetField}
            />
          </figure>
        )}

        {/* Auditoria */}
        <footer className="flex flex-col gap-1 border-t border-border pt-3 text-xs text-muted-foreground">
          <p>
            {t.addresses.sentBy}{" "}
            <span className="font-medium text-foreground">
              {address.createdUser?.name ?? t.addresses.unknownUser}
            </span>
          </p>
          <p>
            {t.addresses.updatedAtLabel}{" "}
            <time dateTime={new Date(address.updatedAt).toISOString()}>
              {formatDate(address.updatedAt, locale)}
            </time>
            {address.updatedUser && (
              <>
                {" "}
                por <span className="font-medium text-foreground">{address.updatedUser.name}</span>
              </>
            )}
          </p>
        </footer>

        {/* Ações */}
        <div className="flex flex-col gap-2">
          <Link href={`/org/${organizationSlug}/addresses/${address.id}/edit`} className="w-full">
            <Button className="w-full" variant="outline">
              <Pencil className="size-4" aria-hidden />
              {t.addresses.editAddress}
            </Button>
          </Link>
          <DeleteAddressButton
            addressId={address.id}
            isPendingDeletion={!!address.pendingDeletionAt}
          />
        </div>
      </section>

      {hasCoordinates && (
        <AddressMapModal
          open={mapOpen}
          onClose={() => setMapOpen(false)}
          latitude={Number(address.latitude)}
          longitude={Number(address.longitude)}
        />
      )}
    </article>
  );
}
