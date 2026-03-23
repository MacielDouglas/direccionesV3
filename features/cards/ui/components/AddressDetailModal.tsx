"use client";

import { Suspense, use } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AddressViewMap } from "@/features/map/components/AddressViewMap";
import { AddressImageViewer } from "@/features/addresses/ui/components/AddressImageViewer";
import { ADDRESS_TYPE_OPTIONS } from "@/features/addresses/domain/constants/address.constants";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteAddressButton from "@/features/addresses/ui/components/DeleteAddressButton";
import { AddressWithUsers } from "@/features/addresses/types/address.types";
import { CircleAlert } from "lucide-react";

const ADDRESS_COLOR_MAP: Record<string, string> = {
  House: "bg-green-500",
  Apartment: "bg-pink-500",
  Hotel: "bg-blue-500",
  Store: "bg-yellow-300",
  Restaurant: "bg-brand",
};

function getAddressColor(type: string) {
  return ADDRESS_COLOR_MAP[type] ?? "bg-brand";
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

export function AddressDetailModal({
  promise,
  onClose,
  organizationSlug,
}: Props) {
  return (
    <Dialog
      open={!!promise}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="flex flex-col w-full max-w-2xl max-h-[92dvh] overflow-y-auto p-0 gap-0 rounded-2xl">
        <DialogHeader className="px-4 pt-5 pb-3 text-start shrink-0">
          <DialogTitle className="text-base font-semibold">
            Dirección
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Usa el mapa para llegar o abre Google Maps / Waze. También puedes
            editar, confirmar o desactivar esta dirección.
          </DialogDescription>
        </DialogHeader>

        {promise && (
          <Suspense fallback={<AddressDetailSkeleton />}>
            <AddressContent
              promise={promise}
              organizationSlug={organizationSlug}
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
    <div className="flex flex-col gap-2 px-3 py-4">
      <Skeleton className="w-full h-52 rounded-2xl" />
      <div className="flex flex-col gap-4 rounded-2xl bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-2 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="h-10 w-10 rounded" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="w-full h-48 rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="flex flex-col gap-1.5 border-t pt-3">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-3 w-36" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

// ─── Content ─────────────────────────────────────────────────────────────────

function AddressContent({
  promise,
  organizationSlug,
}: {
  promise: Promise<AddressWithUsers | null>;
  organizationSlug: string;
}) {
  const address = use(promise);

  if (!address)
    return (
      <div className="flex items-center justify-center py-16 text-sm text-destructive px-4 text-center">
        Dirección no encontrada.
      </div>
    );

  const typeConfig = ADDRESS_TYPE_OPTIONS.find((t) => t.value === address.type);
  const Icon = typeConfig?.icon;
  const colorClass = getAddressColor(address.type);

  return (
    <article className="flex flex-col gap-2 px-3 py-4">
      {/* Mapa */}
      {address.latitude && address.longitude && (
        <section
          aria-label="Mapa de la dirección"
          className="relative w-full overflow-hidden rounded-2xl"
        >
          <Suspense fallback={<Skeleton className="w-full h-52 rounded-2xl" />}>
            <div className="h-115 w-full">
              <AddressViewMap
                latitude={Number(address.latitude)}
                longitude={Number(address.longitude)}
              />
            </div>
          </Suspense>

          {address.pendingDeletionAt && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-red-400 text-xs font-semibold uppercase text-center py-2 px-3">
              Solicitud de borrado pendiente de confirmación
            </div>
          )}
        </section>
      )}

      {/* Detalhes */}
      <section
        aria-label="Detalles de la dirección"
        className="flex flex-col gap-4 rounded-2xl bg-white p-4 dark:bg-surface-subtle-dark"
      >
        {/* Header: nome + ícone */}
        <header className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={`h-8 w-2 shrink-0 rounded-full ${colorClass}`}
              aria-hidden
            />
            <h2 className="truncate text-base font-semibold uppercase tracking-wide sm:text-lg">
              {address.businessName ?? "Residencial"}
            </h2>
          </div>
          {Icon && (
            <div
              className="shrink-0 rounded bg-black/80 p-2"
              aria-label={`Tipo: ${typeConfig?.label}`}
            >
              <Icon className={typeConfig?.color} size={24} aria-hidden />
            </div>
          )}
        </header>

        {/* Badges */}
        <div
          className="flex flex-wrap gap-2 "
          role="group"
          aria-label="Estado de la dirección"
        >
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              address.confirmed
                ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
            }`}
          >
            {address.confirmed ? "✓ Confirmada" : "✗ No confirmada"}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              address.active
                ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            {address.active ? "✓ Activa" : "✗ Inactiva"}
          </span>
        </div>

        {/* Campos */}
        <section aria-labelledby="modal-address-info">
          <h3 id="modal-address-info" className="sr-only">
            Información de ubicación
          </h3>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400">
                Calle
              </dt>
              <dd className="mt-0.5 text-sm font-medium text-gray-800 dark:text-slate-200">
                {address.street}, {address.number}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400">
                Barrio
              </dt>
              <dd className="mt-0.5 text-sm font-medium text-gray-800 dark:text-slate-200">
                {address.neighborhood}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400">
                Ciudad
              </dt>
              <dd className="mt-0.5 text-sm font-medium text-gray-800 dark:text-slate-200">
                {address.city}
              </dd>
            </div>
            {address.businessName && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-400">
                  Negocio
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-gray-800 dark:text-slate-200">
                  {address.businessName}
                </dd>
              </div>
            )}
          </dl>
        </section>

        {!address.active && (
          <p className="text-red-500 font-semibold text-lg inline-flex gap-2">
            <CircleAlert
              className="size-6 shrink-0 text-red-500 animate-bounce"
              aria-hidden
            />{" "}
            Dirección desactivada. Puede haber cambiado.
            <br />
            Revise notas o contacte a quien la actualizó.
          </p>
        )}

        {/* Info adicional */}
        {address.info && (
          <section className="rounded-xl bg-gray-100 p-3 dark:bg-surface-elevated-dark">
            <h3 className="mb-1.5 text-xs font-semibold text-gray-700 dark:text-slate-300">
              Información adicional
            </h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-400">
              {address.info}
            </p>
          </section>
        )}

        {/* Footer: auditoria + ações */}
        <footer className="flex flex-col gap-3 border-t border-gray-100 pt-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-400">
              Enviado por:{" "}
              <span className="font-medium text-gray-600 dark:text-slate-300">
                {address.createdUser?.name ?? "Usuario desconocido"}
              </span>
            </p>
            <p className="text-xs text-gray-400">
              Actualizado:{" "}
              <time dateTime={new Date(address.updatedAt).toISOString()}>
                {formatDate(address.updatedAt)}
              </time>
              {address.updatedUser && (
                <>
                  {" "}
                  por{" "}
                  <span className="font-medium text-gray-600 dark:text-slate-300">
                    {address.updatedUser.name}
                  </span>
                </>
              )}
            </p>
          </div>

          {/* Imagem */}
          {address.image && (
            <figure className="w-full overflow-hidden rounded-xl">
              <AddressImageViewer
                src={address.image}
                alt={`Imagen de ${address.businessName ?? "la dirección"}`}
              />
            </figure>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              href={`/org/${organizationSlug}/addresses/${address.id}/edit`}
              className="w-full sm:w-auto"
            >
              <Button className="w-full">Editar dirección</Button>
            </Link>
          </div>
          <DeleteAddressButton addressId={address.id} />
        </footer>
      </section>
    </article>
  );
}
