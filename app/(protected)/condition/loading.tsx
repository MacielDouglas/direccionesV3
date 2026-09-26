import { Skeleton } from "@/components/ui/skeleton";
import { getServerDictionary } from "@/lib/i18n/server";

export default async function ConditionLoading() {
  const t = await getServerDictionary();
  return (
    <div
      className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:py-10"
      aria-busy="true"
      aria-label={t.common.loadingLabels.conditions}
    >
      <section className="rounded-2xl border bg-card p-6 shadow-xs">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-3 h-4 w-3/4" />
      </section>

      <div className="flex flex-col gap-6">
        {Array.from({ length: 3 }, (_, i) => i + 1).map((item) => (
          <div
            key={`skeleton-${item}`}
            className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs sm:p-6"
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
