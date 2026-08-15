import { Skeleton } from "@/components/ui/skeleton";
import { getServerDictionary } from "@/lib/i18n/server";

export default async function JoinLoading() {
  const t = await getServerDictionary();
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4">
      <article
        aria-label={t.common.loadingLabels.invitation}
        aria-busy="true"
        className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-sm flex flex-col gap-5 text-center"
      >
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="size-16 rounded-full" />
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
      </article>
    </main>
  );
}
