import { Skeleton } from "@/components/ui/skeleton";

export default function ConditionLoading() {
  return (
    <div className="space-y-6 px-4 py-6" aria-busy="true" aria-label="Cargando condiciones">
      <section className="mx-auto max-w-2xl rounded-2xl border bg-card p-6 shadow-xs">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-3 h-4 w-3/4" />
      </section>

      <div className="mx-auto max-w-2xl space-y-6 p-6">
        {Array.from({ length: 2 }, (_, i) => i + 1).map((item) => (
          <div
            key={`skeleton-${item}`}
            className="space-y-3 rounded-2xl border bg-card p-4 shadow-xs"
          >
            <Skeleton className="h-6 w-40" />
            {Array.from({ length: 3 }, (_, j) => j + 1).map((inner) => (
              <Skeleton key={`skeleton-${inner}`} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
