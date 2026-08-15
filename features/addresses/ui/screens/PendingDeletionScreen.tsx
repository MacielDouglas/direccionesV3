import { getServerDictionary } from "@/lib/i18n/server";
import type { Address } from "@prisma/client";
import { ArrowLeft } from "lucide-react";
import { CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { AddressHeroImage } from "../components/AddressHeroImage";
import { PendingDeletionActions } from "../components/PendingDeletionActions";

type PendingDeletionAddress = Address & {
  requestedBy?: { name: string | null; user: { email: string | null } | null } | null;
};

interface Props {
  addresses: PendingDeletionAddress[];
  organizationSlug: string;
}

function formatDate(date: Date | string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: "America/Bogota",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export default async function PendingDeletionScreen({ addresses, organizationSlug }: Props) {
  const t = await getServerDictionary();

  const countLabel =
    addresses.length === 1
      ? t.addresses.pendingDeletionCountOne
      : t.addresses.pendingDeletionCountMany.replace("{count}", String(addresses.length));

  if (addresses.length === 0) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-7 md:py-10">
        <header className="mb-6 flex items-start gap-3">
          <Link
            href={`/org/${organizationSlug}/admin/gestao`}
            aria-label={t.common.back}
            className="mt-1 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <ArrowLeft className="h-6 w-6" aria-hidden="true" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
              {t.addresses.deletionRequestsTitle}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{countLabel}</p>
          </div>
        </header>

        <div className="text-center py-16">
          <p className="text-muted-foreground">{t.addresses.noPendingDeletions}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-7 md:py-10">
      <header className="mb-6 flex items-start gap-3">
        <Link
          href={`/org/${organizationSlug}/admin/gestao`}
          aria-label={t.common.back}
          className="mt-1 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <ArrowLeft className="h-6 w-6" aria-hidden="true" />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
            {t.addresses.deletionRequestsTitle}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{countLabel}</p>
        </div>
      </header>

      <ul className="flex flex-col gap-4" aria-label={t.addresses.deletionRequestsTitle}>
        {addresses.map((address) => (
          <li key={address.id}>
            <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-shadow hover:shadow-md">
              {address.image && (
                <AddressHeroImage
                  src={address.image}
                  alt={t.addresses.addressImageAlt.replace(
                    "{name}",
                    address.businessName ?? t.addresses.residential,
                  )}
                  name={address.businessName ?? t.addresses.residential}
                  street={`${address.street}, ${address.number}`}
                  typeLabel={t.addresses.pendingDeletion}
                  typeIcon={
                    <CheckCircle className="size-3.5 text-destructive" aria-hidden="true" />
                  }
                />
              )}

              <div className="flex flex-col gap-4 p-4 sm:p-6">
                <header className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="grid size-10 shrink-0 place-items-center rounded-xl bg-destructive/10"
                      aria-hidden="true"
                    >
                      <XCircle className="size-5 text-destructive" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold text-foreground">
                        {address.businessName ?? t.addresses.residential}
                      </h2>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {address.street}, {address.number} — {address.neighborhood}, {address.city}
                      </p>
                    </div>
                  </div>
                  <span
                    className="shrink-0 inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive"
                    aria-label={t.addresses.pendingDeletion}
                  >
                    <XCircle className="size-3" aria-hidden="true" />
                    {t.addresses.pendingDeletion}
                  </span>
                </header>

                {address.requestedBy && address.pendingDeletionAt && (
                  <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2">
                    <span className="text-xs text-muted-foreground">{t.addresses.requestedBy}</span>
                    <span className="font-medium text-sm text-foreground">
                      {address.requestedBy.name ?? address.requestedBy.user?.email}
                    </span>
                    <time
                      dateTime={address.pendingDeletionAt.toISOString()}
                      className="ml-auto text-xs text-muted-foreground"
                    >
                      {formatDate(address.pendingDeletionAt, "pt-BR")}
                    </time>
                  </div>
                )}

                <footer className="flex flex-col gap-2 sm:flex-row sm:items-stretch pt-2 border-t border-border">
                  <PendingDeletionActions addressId={address.id} />
                </footer>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </main>
  );
}
