import { Building2 } from "lucide-react";

export default function OrganizationsLoading() {
  return (
    <main
      className="mx-auto w-full max-w-3xl px-4 py-10"
      aria-busy="true"
      aria-label="Cargando organizaciones"
    >
      <header className="flex flex-col items-center gap-2 text-center">
        <Building2 className="h-10 w-10 text-brand opacity-30" aria-hidden="true" />
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-56 animate-pulse rounded bg-muted" />
      </header>

      <div className="mt-8 flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, i) => i + 1).map((item) => (
          <div
            key={`skeleton-${item}`}
            className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-4 shadow-sm"
          >
            <div className="flex-1 space-y-2">
              <div className="h-5 w-40 animate-pulse rounded bg-muted" />
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-6 w-14 shrink-0 animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </main>
  );
}
