import { Button } from "@/components/ui/button";
import { AddressViewMap } from "@/features/map/components/AddressViewMap";
import { getServerDictionary, getServerLocale } from "@/lib/i18n/server";
import { getUniquePerson } from "@/server/users";
import type { Address } from "@prisma/client";
import { ArrowLeft, CircleAlert } from "lucide-react";
import Link from "next/link";
import { ADDRESS_TYPE_OPTIONS } from "../../domain/constants/address.constants";
import { AddressHeroImage } from "../components/AddressHeroImage";
import DeleteAddressButton from "../components/DeleteAddressButton";

type AddressDetailsScreenProps = {
  address: Address;
  organizationSlug: string;
};

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
  const colorClass = typeConfig?.color ?? "text-brand";
  const title = address.businessName ?? t.addresses.residential;
  const addressLine = [`${address.street}, ${address.number}`, address.neighborhood, address.city]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-7 md:py-10">
      <header className="mb-5 flex items-start gap-3">
        <Link
          href={`/org/${organizationSlug}/addresses`}
          aria-label={t.common.back}
          className="mt-1 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <ArrowLeft className="h-6 w-6" aria-hidden="true" />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{addressLine}</p>
        </div>
      </header>

      <div className="flex flex-col gap-4">
        {address.image && (
          <AddressHeroImage
            src={address.image}
            alt={t.addresses.addressImageAlt.replace("{name}", title)}
            name={title}
            street={`${address.street}, ${address.number}`}
            typeLabel={typeConfig ? t.admin[typeConfig.labelKey] : address.type}
            typeIcon={
              Icon ? <Icon className={`size-3.5 ${colorClass}`} aria-hidden="true" /> : null
            }
          />
        )}

        <section
          aria-label={t.addresses.detailsAria}
          className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-6"
        >
          <header className="flex flex-wrap items-center gap-3">
            {Icon && (
              <div
                className="grid size-11 shrink-0 place-items-center rounded-2xl bg-black/80"
                aria-label={t.addresses.typeAria.replace(
                  "{label}",
                  typeConfig?.label ?? address.type,
                )}
              >
                <Icon className={colorClass} size={24} aria-hidden="true" />
              </div>
            )}
            <ul className="flex flex-wrap gap-2" aria-label={t.addresses.statusAria}>
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
          </header>

          {!address.confirmed && (
            <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
              <CircleAlert className="size-5 shrink-0 text-destructive" aria-hidden="true" />
              <p className="text-sm font-medium text-destructive">
                {t.addresses.notVerifiedWarning}
              </p>
            </div>
          )}

          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                {t.addresses.streetField}
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground sm:text-base">
                {address.street}, {address.number}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                {t.addresses.neighborhoodField}
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground sm:text-base">
                {address.neighborhood}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                {t.addresses.cityField}
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground sm:text-base">
                {address.city}
              </dd>
            </div>
          </dl>

          {!address.active && (
            <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
              <CircleAlert className="size-5 shrink-0 text-destructive" aria-hidden="true" />
              <p className="text-sm font-medium text-destructive">{t.addresses.inactiveWarning}</p>
            </div>
          )}

          {address.info && (
            <section aria-labelledby="extra-info-title" className="rounded-xl bg-muted p-4">
              <h2
                id="extra-info-title"
                className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-foreground sm:text-sm"
              >
                {t.addresses.additionalInfo}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{address.info}</p>
            </section>
          )}

          <footer className="flex flex-col gap-4 border-t border-border pt-4">
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                {t.addresses.sentBy}{" "}
                <span className="font-medium text-foreground">
                  {createdUser?.name ?? t.addresses.unknownUser}
                </span>
              </p>
              <p className="flex flex-wrap gap-1 text-xs text-muted-foreground sm:text-end">
                {t.addresses.updatedAtLabel}{" "}
                <time dateTime={new Date(address.updatedAt).toISOString()}>
                  {formatDate(address.updatedAt, locale)}
                </time>
                {updatedUser && (
                  <span className="font-medium text-foreground">{updatedUser.name}</span>
                )}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href={`/org/${organizationSlug}/addresses/${address.id}/edit`}
                className="sm:flex-1"
              >
                <Button className="h-11 w-full">{t.addresses.editAddress}</Button>
              </Link>
              <div className="sm:flex-1">
                <DeleteAddressButton addressId={address.id} />
              </div>
            </div>
          </footer>
        </section>

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
      </div>
    </main>
  );
}
