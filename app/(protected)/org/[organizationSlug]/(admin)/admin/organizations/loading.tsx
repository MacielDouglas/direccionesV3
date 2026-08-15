import { getServerDictionary } from "@/lib/i18n/server";
import { Building2 } from "lucide-react";

export default async function AdminOrganizationsLoading() {
  const t = await getServerDictionary();
  return (
    <div
      className="mx-auto mt-4 flex w-full max-w-3xl flex-col gap-6 px-4"
      aria-busy="true"
      aria-label={t.common.loadingLabels.organizations}
    >
      <header className="flex items-center gap-3">
        <Building2 className="h-8 w-8 text-brand opacity-30" aria-hidden="true" />
        <div className="h-8 w-52 animate-pulse rounded-md bg-muted" />
      </header>

      <section className="flex flex-col gap-4 rounded-xl bg-muted p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-6 w-56 animate-pulse rounded bg-muted" />
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
      </section>
    </div>
  );
}
