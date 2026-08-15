import { Skeleton } from "@/components/ui/skeleton";
import { getServerDictionary } from "@/lib/i18n/server";

export default async function ConditionLoading() {
  const t = await getServerDictionary();
  return (
    <div
      className="space-y-6 px-4 py-6"
      aria-busy="true"
      aria-label={t.common.loadingLabels.conditions}
    >
      <section className="mx-auto max-w-3xl rounded-2xl border bg-card p-6 shadow-xs">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-3 h-4 w-3/4" />
      </section>

      <div className="mx-auto max-w-3xl space-y-6 p-6">
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
