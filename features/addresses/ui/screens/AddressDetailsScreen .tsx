import type { Address } from "@prisma/client";
import { ADDRESS_TYPE_OPTIONS } from "../../domain/constants/address.constants";
import { getUniqueUser } from "@/server/users";
import { AddressImageViewer } from "../components/AddressImageViewer";
import { AddressViewMap } from "@/features/map/components/AddressViewMap";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DeleteAddressButton from "../components/DeleteAddressButton";
import { CircleAlert } from "lucide-react";
// import { useState } from "react";

type AddressDetailsScreenProps = {
  address: Address;
  organizationSlug: string;
};

const ADDRESS_COLOR_MAP: Record<string, string> = {
  House: "bg-green-500",
  Apartment: "bg-pink-500",
  Hotel: "bg-blue-500",
  Store: "bg-yellow-300",
  Restaurant: "bg-brand",
};

function getAddressColor(type: string): string {
  return ADDRESS_COLOR_MAP[type] ?? "bg-brand";
}

function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("es-419", {
    timeZone: "America/Bogota",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export default async function AddressDetailsScreen({
  address,
  organizationSlug,
}: AddressDetailsScreenProps) {
  const [createdUser, updatedUser] = await Promise.all([
    getUniqueUser(address.createdUserId),
    address.updatedUserId ? getUniqueUser(address.updatedUserId) : null,
  ]);
  // const [editing, setEditing] = useState(false)

  const typeConfig = ADDRESS_TYPE_OPTIONS.find((t) => t.value === address.type);
  const Icon = typeConfig?.icon;
  const colorClass = getAddressColor(address.type);

  return (
    <article className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-3 py-4 sm:px-4 sm:py-6">
      {address.latitude && address.longitude && (
        <section
          aria-label="Mapa de la dirección"
          className="w-full overflow-hidden rounded-2xl"
        >
          <AddressViewMap
            latitude={Number(address.latitude)}
            longitude={Number(address.longitude)}
          />
        </section>
      )}

      <section
        aria-label="Detalles de la dirección"
        className="flex flex-col gap-4 rounded-2xl bg-white p-4 dark:bg-surface-subtle-dark sm:p-6"
      >
        <header className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={`h-8 w-2 shrink-0 rounded-full ${colorClass}`}
              aria-hidden="true"
            />
            <h1 className="truncate text-lg font-semibold uppercase tracking-wide sm:text-2xl">
              {address.businessName ?? "Residencial"}
            </h1>
          </div>

          {Icon && (
            <div
              className="shrink-0 rounded bg-black/80 p-2"
              aria-label={`Tipo: ${typeConfig?.label}`}
            >
              <Icon
                className={typeConfig?.color}
                size={28}
                aria-hidden="true"
              />
            </div>
          )}
        </header>
        <div
          className="flex flex-wrap gap-3"
          role="group"
          aria-label="Estado de la dirección"
        >
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold sm:text-sm ${
              address.confirmed
                ? "bg-blue-100 text-blue-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {address.confirmed ? "✓ Confirmada" : "✗ No confirmada"}
          </span>
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold sm:text-sm ${
              address.active
                ? "bg-blue-100 text-blue-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {address.active ? "✓ Activa" : "✗ Inactiva"}
          </span>
        </div>

        {address.image && (
          <figure className="w-full overflow-hidden rounded-xl">
            <AddressImageViewer
              src={address.image}
              alt={`Imagen de ${address.businessName ?? "la dirección"}`}
            />
          </figure>
        )}

        <section aria-labelledby="address-info-title">
          <h2 id="address-info-title" className="sr-only">
            Información de ubicación
          </h2>
          {!address.confirmed && (
            <div className="flex gap-2 items-center border border-red-500 py-2 px-4 rounded-xl justify-between bg-red-100 dark:bg-red-950 mb-3">
              <CircleAlert
                className="size-6 shrink-0 text-red-500 animate-pulse"
                aria-hidden
              />{" "}
              <p className="text-red-500 font-semibold text-xs inline-flex gap-2 ">
                Dirección no verificada, puede tener errores. Revise la
                información adicional o confirme con quien la envió.
              </p>
            </div>
          )}
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400">
                Calle
              </dt>
              <dd className="mt-0.5 text-sm font-medium text-gray-800 dark:text-slate-200 sm:text-base">
                {address.street}, {address.number}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400">
                Barrio
              </dt>
              <dd className="mt-0.5 text-sm font-medium text-gray-800 dark:text-slate-200 sm:text-base">
                {address.neighborhood}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400">
                Ciudad
              </dt>
              <dd className="mt-0.5 text-sm font-medium text-gray-800 dark:text-slate-200 sm:text-base">
                {address.city}
              </dd>
            </div>
          </dl>
        </section>
        {!address.active && (
          <div className="flex gap-2 items-center border border-red-500 py-2 px-4 rounded-xl justify-between bg-red-100 dark:bg-red-950">
            <CircleAlert
              className="size-10 shrink-0 text-red-500 animate-pulse"
              aria-hidden
            />{" "}
            <p className="text-red-500 font-semibold text-md inline-flex gap-2 text-center">
              Dirección desactivada. Puede haber cambiado.
              <br />
              Revise notas o contacte a quien la actualizó.
            </p>
          </div>
        )}

        {address.info && (
          <section
            aria-labelledby="extra-info-title"
            className="rounded-xl bg-gray-100 p-3 dark:bg-surface-elevated-dark sm:p-4"
          >
            <h2
              id="extra-info-title"
              className="mb-1.5 text-xs font-semibold text-gray-700 dark:text-slate-300 sm:text-sm"
            >
              Información adicional
            </h2>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-400">
              {address.info}
            </p>
          </section>
        )}

        <footer className="flex flex-col gap-3 border-t border-gray-100 pt-3">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-400">
              Enviado por:{" "}
              <span className="font-medium text-gray-600 dark:text-slate-300">
                {createdUser?.name ?? "Usuario desconocido"}
              </span>
            </p>
            <p className="flex gap-1 text-xs text-gray-400 sm:text-end">
              Actualizado:{" "}
              <time dateTime={new Date(address.updatedAt).toISOString()}>
                {formatDate(address.updatedAt)}
              </time>
              {updatedUser && (
                <>
                  {" "}
                  por{" "}
                  <span className="font-medium text-gray-600 dark:text-slate-300">
                    {updatedUser.name}
                  </span>
                </>
              )}
            </p>
          </div>

          <Link href={`/org/${organizationSlug}/addresses/${address.id}/edit`}>
            <Button className="w-full sm:w-auto">Editar dirección</Button>
          </Link>
        </footer>
      </section>
      <section className="p-4">
        <DeleteAddressButton addressId={address.id} />
      </section>
    </article>
  );
}
