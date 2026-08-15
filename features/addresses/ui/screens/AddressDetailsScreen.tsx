import { Button } from "@/components/ui/button";
import { AddressViewMap } from "@/features/map/components/AddressViewMap";
import { getServerDictionary, getServerLocale } from "@/lib/i18n/server";
import { getUniquePerson } from "@/server/users";
import type { Address } from "@prisma/client";
import { CircleAlert } from "lucide-react";
import Link from "next/link";
import { ADDRESS_TYPE_OPTIONS } from "../../domain/constants/address.constants";
import { AddressImageViewer } from "../components/AddressImageViewer";
import DeleteAddressButton from "../components/DeleteAddressButton";

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

function formatDate(date: Date | string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
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
  const [createdUser, updatedUser, t, locale] = await Promise.all([
    getUniquePerson(address.createdByPersonId),
    address.updatedByPersonId ? getUniquePerson(address.updatedByPersonId) : null,
    getServerDictionary(),
    getServerLocale(),
  ]);

  const typeConfig = ADDRESS_TYPE_OPTIONS.find((type) => type.value === address.type);
  const Icon = typeConfig?.icon;
  const colorClass = getAddressColor(address.type);

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-3 py-4 sm:px-4 sm:py-6">
      {address.latitude && address.longitude && (
        <section
          aria-label={t.addresses.addressMapAria}
          className="w-full overflow-hidden rounded-2xl"
        >
          <AddressViewMap
            latitude={Number(address.latitude)}
            longitude={Number(address.longitude)}
          />
        </section>
      )}

      <section
        aria-label={t.addresses.detailsAria}
        className="flex flex-col gap-4 rounded-2xl bg-white p-4 dark:bg-surface-subtle-dark sm:p-6"
      >
        <header className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className={`h-8 w-2 shrink-0 rounded-full ${colorClass}`} aria-hidden="true" />
            <h1 className="truncate text-2xl font-semibold tracking-tight">
              {address.businessName ?? t.addresses.residential}
            </h1>
          </div>

          {Icon && (
            <div
              className="shrink-0 rounded bg-black/80 p-2"
              aria-label={t.addresses.typeAria.replace(
                "{label}",
                typeConfig?.label ?? address.type,
              )}
            >
              <Icon className={typeConfig?.color} size={28} aria-hidden="true" />
            </div>
          )}
        </header>
        <ul className="flex flex-wrap gap-3" aria-label={t.addresses.statusAria}>
          <li
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
              address.confirmed
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
            }`}
          >
            {address.confirmed ? `✓ ${t.addresses.confirmed}` : `✗ ${t.addresses.notConfirmed}`}
          </li>
          <li
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
              address.active
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
            }`}
          >
            {address.active ? `✓ ${t.addresses.active}` : `✗ ${t.addresses.inactive}`}
          </li>
        </ul>

        {address.image && (
          <figure className="w-full overflow-hidden rounded-xl">
            <AddressImageViewer
              src={address.image}
              alt={t.addresses.addressImageAlt.replace(
                "{name}",
                address.businessName ?? t.addresses.residential,
              )}
            />
          </figure>
        )}

        <section aria-labelledby="address-info-title">
          <h2 id="address-info-title" className="sr-only">
            {t.addresses.infoTitle}
          </h2>
          {!address.confirmed && (
            <div className="flex gap-2 items-center border border-red-500 py-2 px-4 rounded-xl justify-between bg-red-100 dark:bg-red-950 mb-3">
              <CircleAlert className="size-6 shrink-0 text-red-500 animate-pulse" aria-hidden />{" "}
              <p className="text-red-500 font-semibold text-xs inline-flex gap-2 ">
                {t.addresses.notVerifiedWarning}
              </p>
            </div>
          )}
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400">
                {t.addresses.streetField}
              </dt>
              <dd className="mt-0.5 text-sm font-medium text-gray-800 dark:text-slate-200 sm:text-base">
                {address.street}, {address.number}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400">
                {t.addresses.neighborhoodField}
              </dt>
              <dd className="mt-0.5 text-sm font-medium text-gray-800 dark:text-slate-200 sm:text-base">
                {address.neighborhood}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400">
                {t.addresses.cityField}
              </dt>
              <dd className="mt-0.5 text-sm font-medium text-gray-800 dark:text-slate-200 sm:text-base">
                {address.city}
              </dd>
            </div>
          </dl>
        </section>
        {!address.active && (
          <div className="flex gap-2 items-center border border-red-500 py-2 px-4 rounded-xl justify-between bg-red-100 dark:bg-red-950">
            <CircleAlert className="size-10 shrink-0 text-red-500 animate-pulse" aria-hidden />{" "}
            <p className="text-red-500 font-semibold text-md inline-flex gap-2 text-center">
              {t.addresses.inactiveWarning}
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
              {t.addresses.additionalInfo}
            </h2>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-400">
              {address.info}
            </p>
          </section>
        )}

        <footer className="flex flex-col gap-3 border-t border-gray-100 pt-3">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-400">
              {t.addresses.sentBy}{" "}
              <span className="font-medium text-gray-600 dark:text-slate-300">
                {createdUser?.name ?? t.addresses.unknownUser}
              </span>
            </p>
            <p className="flex gap-1 text-xs text-gray-400 sm:text-end">
              {t.addresses.updatedAtLabel}{" "}
              <time dateTime={new Date(address.updatedAt).toISOString()}>
                {formatDate(address.updatedAt, locale)}
              </time>
              {updatedUser && (
                <span className="font-medium text-gray-600 dark:text-slate-300">
                  {updatedUser.name}
                </span>
              )}
            </p>
          </div>

          <Link href={`/org/${organizationSlug}/addresses/${address.id}/edit`}>
            <Button className="h-11 w-full sm:w-auto">{t.addresses.editAddress}</Button>
          </Link>
        </footer>
      </section>
      <section className="p-4">
        <DeleteAddressButton addressId={address.id} />
      </section>
    </article>
  );
}
