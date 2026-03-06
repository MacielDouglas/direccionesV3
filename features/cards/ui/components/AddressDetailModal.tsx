"use client";

import { Suspense, use } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Address } from "@prisma/client";
import { AddressViewMap } from "@/features/map/components/AddressViewMap";
import { MapPin, Building2, Info, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteAddressButton from "@/features/addresses/ui/components/DeleteAddressButton";

interface Props {
  promise: Promise<Address | null> | null;
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
      <DialogContent className="max-w-2xl w-full max-h-[90dvh] overflow-y-auto p-0">
        <DialogHeader className="px-4 pt-4 pb-0 text-start">
          <DialogTitle className="text-lg font-semibold">Dirección</DialogTitle>
          <DialogDescription>
            Puedes usar el mapa para llegar a la dirección o, si lo prefieres,
            abrir Google Maps o Waze. También puedes actualizar, confirmar o
            desactivar esta dirección.
          </DialogDescription>
        </DialogHeader>

        {promise && (
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                Cargando...
              </div>
            }
          >
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

function AddressContent({
  promise,
  organizationSlug,
}: {
  promise: Promise<Address | null>;
  organizationSlug: string;
}) {
  const address = use(promise);

  if (!address)
    return (
      <div className="flex items-center justify-center py-16 text-sm text-destructive">
        Dirección no encontrada.
      </div>
    );

  return (
    <div className="flex flex-col gap-4 p-4">
      {address.latitude && address.longitude && (
        <div className="w-full overflow-hidden rounded-xl">
          <AddressViewMap
            latitude={Number(address.latitude)}
            longitude={Number(address.longitude)}
          />
          {address.pendingDeletionAt && (
            <div className="absolute top-50% left-0 bg-black/80 text-red-500 uppercase w-full text-center p-2">
              Solicitado borrar dirección. Confirmación pendiente.
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold ${
              address.confirmed
                ? "bg-blue-100 text-blue-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {address.confirmed ? "✓ Confirmada" : "✗ No confirmada"}
          </span>
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold ${
              address.active
                ? "bg-blue-100 text-blue-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {address.active ? "✓ Activa" : "✗ Inactiva"}
          </span>
        </div>

        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1">
              <MapPin className="size-3" aria-hidden /> Calle
            </dt>
            <dd className="mt-0.5 text-sm font-medium">
              {address.street}, {address.number}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Barrio
            </dt>
            <dd className="mt-0.5 text-sm font-medium">
              {address.neighborhood}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Ciudad
            </dt>
            <dd className="mt-0.5 text-sm font-medium">{address.city}</dd>
          </div>
          {address.businessName && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                <Building2 className="size-3" aria-hidden /> Negocio
              </dt>
              <dd className="mt-0.5 text-sm font-medium">
                {address.businessName}
              </dd>
            </div>
          )}
        </dl>

        {address.info && (
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1">
              <Info className="size-3" aria-hidden /> Información adicional
            </p>
            <p className="text-sm leading-relaxed">{address.info}</p>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-t pt-3">
          <Calendar className="size-3.5 shrink-0" aria-hidden />
          Actualizado:{" "}
          {new Intl.DateTimeFormat("es-419", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).format(new Date(address.updatedAt))}
        </div>
        <section className="flex flex-col gap-3">
          <Link href={`/org/${organizationSlug}/addresses/${address.id}/edit`}>
            <Button className="w-full sm:w-auto">Editar dirección</Button>
          </Link>

          <DeleteAddressButton addressId={address.id} />
        </section>
      </div>
    </div>
  );
}
