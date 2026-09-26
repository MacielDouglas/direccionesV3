import { getServerDictionary } from "@/lib/i18n/server";

export default async function UserLoading() {
  const t = await getServerDictionary();
  return (
    <main
      className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8"
      aria-busy="true"
      aria-label={t.common.loadingLabels.profile}
    >
      {/* Hero */}
      <div className="rounded-2xl bg-black p-6 sm:p-8">
        <div className="h-3 w-20 animate-pulse rounded bg-white/20" />
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="size-20 shrink-0 animate-pulse rounded-full bg-white/20" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-7 w-48 animate-pulse rounded-md bg-white/20" />
            <div className="h-4 w-56 max-w-full animate-pulse rounded bg-white/20" />
            <div className="h-5 w-24 animate-pulse rounded-full bg-white/20" />
          </div>
        </div>
      </div>
      {/* Cartões */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        </div>
        {Array.from({ length: 2 }, (_, i) => i + 1).map((item) => (
          <div
            key={`skeleton-${item}`}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5"
          >
            <div className="size-5 shrink-0 animate-pulse rounded bg-muted" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-3 w-40 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
