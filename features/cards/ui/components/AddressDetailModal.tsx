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
import { AddressViewMap } from "@/features/map/components/AddressViewMap";
import { cn } from "@/lib/utils";
import { CircleAlert, MapPin, Pencil, X } from "lucide-react";
import Link from "next/link";
import { Suspense, use } from "react";

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

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("es-419", {
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
          <DialogTitle>Dirección</DialogTitle>
          <DialogDescription>Detalles y mapa de la dirección.</DialogDescription>
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
      <div className="sticky top-0 z-20 flex items-center justify-end border-b border-border bg-card/95 p-3 backdrop-blur">
        <Skeleton className="size-9 rounded-full" />
      </div>
      <Skeleton className="h-96 w-full" />
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
  const address = use(promise);

  if (!address)
    return (
      <div className="flex items-center justify-center px-4 py-16 text-center text-sm text-destructive">
        Dirección no encontrada.
      </div>
    );

  const typeConfig = ADDRESS_TYPE_OPTIONS.find((t) => t.value === address.type);
  const Icon = typeConfig?.icon;
  const fullAddress = `${address.street}, ${address.number} · ${address.neighborhood}, ${address.city}`;

  return (
    <article className="flex flex-col">
      {/* Topo fixo: fechar */}
      <div className="sticky top-0 z-20 flex items-center justify-end border-b border-border/60 bg-card/95 p-3 backdrop-blur">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="grid size-11 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      {/* Mapa + rota */}
      {address.latitude != null && address.longitude != null && (
        <section aria-label="Mapa de la dirección" className="relative">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <AddressViewMap
              latitude={Number(address.latitude)}
              longitude={Number(address.longitude)}
            />
          </Suspense>

          {address.pendingDeletionAt && (
            <div className="absolute inset-x-0 bottom-0 bg-black/80 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-red-400">
              Solicitud de borrado pendiente de confirmación
            </div>
          )}
        </section>
      )}

      {/* Detalhes */}
      <section
        aria-label="Detalles de la dirección"
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
        <ul className="flex flex-wrap gap-2" aria-label="Estado de la dirección">
          <li
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              address.confirmed
                ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
            )}
          >
            {address.confirmed ? "✓ Confirmada" : "✗ No confirmada"}
          </li>
          <li
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              address.active
                ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
            )}
          >
            {address.active ? "✓ Activa" : "✗ Inactiva"}
          </li>
          {address.pendingDeletionAt && (
            <li className="inline-flex items-center gap-1 rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-white">
              Borrado pendiente
            </li>
          )}
        </ul>

        {/* Informação de localização */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-xl border border-border bg-muted/40 p-4">
          <div>
            <dt className="text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
              Calle
            </dt>
            <dd className="mt-0.5 break-words text-sm font-medium text-foreground">
              {address.street}, {address.number}
            </dd>
          </div>
          <div>
            <dt className="text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
              Barrio
            </dt>
            <dd className="mt-0.5 break-words text-sm font-medium text-foreground">
              {address.neighborhood}
            </dd>
          </div>
          <div>
            <dt className="text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
              Ciudad
            </dt>
            <dd className="mt-0.5 break-words text-sm font-medium text-foreground">
              {address.city}
            </dd>
          </div>
          <div>
            <dt className="text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
              Tipo
            </dt>
            <dd className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
              {Icon && <Icon className={cn("size-4", typeConfig?.color)} aria-hidden />}
              {typeConfig?.label ?? address.type}
            </dd>
          </div>
          {address.businessName && (
            <div className="col-span-2">
              <dt className="text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
                Negocio
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
            Dirección desactivada. Puede haber cambiado. Revise notas o contacte a quien la
            actualizó.
          </p>
        )}

        {/* Informação adicional */}
        {address.info && (
          <section className="rounded-xl bg-muted p-4">
            <h3 className="mb-1.5 text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
              Información adicional
            </h3>
            <p className="text-sm leading-relaxed text-foreground/80">{address.info}</p>
          </section>
        )}

        {/* Imagem */}
        {address.image && (
          <figure className="w-full overflow-hidden rounded-xl">
            <AddressImageViewer
              src={address.image}
              alt={`Imagen de ${address.businessName ?? "la dirección"}`}
            />
          </figure>
        )}

        {/* Auditoria */}
        <footer className="flex flex-col gap-1 border-t border-border pt-3 text-xs text-muted-foreground">
          <p>
            Enviado por:{" "}
            <span className="font-medium text-foreground">
              {address.createdUser?.name ?? "Usuario desconocido"}
            </span>
          </p>
          <p>
            Actualizado:{" "}
            <time dateTime={new Date(address.updatedAt).toISOString()}>
              {formatDate(address.updatedAt)}
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
          {address.latitude != null && address.longitude != null && (
            <NavigateAddressButtons
              latitude={Number(address.latitude)}
              longitude={Number(address.longitude)}
            />
          )}
          <Link href={`/org/${organizationSlug}/addresses/${address.id}/edit`} className="w-full">
            <Button className="w-full" variant="outline">
              <Pencil className="size-4" aria-hidden />
              Editar dirección
            </Button>
          </Link>
          <DeleteAddressButton
            addressId={address.id}
            isPendingDeletion={!!address.pendingDeletionAt}
          />
        </div>
      </section>
    </article>
  );
}
