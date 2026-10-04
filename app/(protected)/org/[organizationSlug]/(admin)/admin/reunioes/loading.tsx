import { Skeleton } from "@/components/ui/skeleton";

export default function AdminReunioesLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-10 flex flex-col gap-6">
      <Skeleton className="h-8 w-24" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="rounded-2xl border bg-card p-5 flex flex-col gap-3">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-40" />
      </div>
    </div>
  );
}
