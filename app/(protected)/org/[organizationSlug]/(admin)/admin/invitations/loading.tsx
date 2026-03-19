// app/org/[organizationSlug]/admin/invitations/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Link2 } from "lucide-react";

export default function InvitationsLoading() {
  return (
    <main
      className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-6"
      aria-busy="true"
      aria-label="Cargando invitaciones"
    >
      {/* Header */}
      <header className="flex items-center gap-3">
        <Link2 className="h-8 w-8 text-brand opacity-30" aria-hidden="true" />
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>
      </header>

      {/* Gerador */}
      <section className="rounded-xl border p-5 space-y-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-10 w-40" />
      </section>

      {/* Histórico */}
      <section className="space-y-3">
        <Skeleton className="h-5 w-24" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card px-4 py-3 space-y-2"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-3 w-56" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </section>
    </main>
  );
}
