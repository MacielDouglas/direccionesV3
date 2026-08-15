import { getServerDictionary } from "@/lib/i18n/server";

export default async function HomeLoading() {
  const t = await getServerDictionary();
  return (
    <div
      className="mx-auto w-full max-w-3xl px-4 py-7 md:py-10"
      aria-busy="true"
      aria-label={t.common.loadingLabels.home}
    >
      <div className="h-8 w-52 animate-pulse rounded-md bg-muted" />

      <div className="mt-6 space-y-6">
        {/* Hero — Saldo de Cards */}
        <div className="flex items-center justify-between gap-4 rounded-xl bg-black p-6 text-white">
          <div className="flex flex-col gap-3">
            <div className="h-3 w-24 animate-pulse rounded bg-white/20" />
            <div className="flex items-baseline gap-2">
              <div className="h-10 w-12 animate-pulse rounded bg-white/20" />
              <div className="h-4 w-12 animate-pulse rounded bg-white/20" />
            </div>
            <div className="h-3 w-32 animate-pulse rounded bg-white/20" />
          </div>
          <div className="size-11 shrink-0 animate-pulse rounded-full bg-white/20" />
        </div>

        {/* Programação de hoje */}
        <section aria-hidden>
          <div className="flex items-center justify-between">
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          </div>
          <div className="mt-3 space-y-2">
            {Array.from({ length: 2 }, (_, i) => i + 1).map((item) => (
              <div
                key={`skeleton-${item}`}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
              >
                <div className="h-11 w-11 shrink-0 animate-pulse rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="h-16 w-full animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}
