import { Skeleton } from "@/components/ui/skeleton";

export default function SavedTextsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-3 w-full" />
      </div>
      <div className="-mx-4 flex gap-2 overflow-hidden px-4">
        {Array.from({ length: 6 }, (_, i) => i + 1).map((item) => (
          <Skeleton key={`skeleton-tab-${item}`} className="h-11 w-24 shrink-0 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-10 w-full rounded-md" />
      {Array.from({ length: 5 }, (_, i) => i + 1).map((item) => (
        <Skeleton key={`skeleton-row-${item}`} className="h-14 w-full rounded-2xl" />
      ))}
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
}
