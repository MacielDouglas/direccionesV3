import { MapPinPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewAddressLoading() {
  return (
    <div
      className="mx-auto h-full w-full max-w-5xl space-y-4"
      aria-busy="true"
      aria-label="Cargando formulario de nueva dirección"
    >
      {/* ── Header ── */}
      <header className="space-y-6 border-b p-5 md:p-10">
        <div className="flex items-center gap-4">
          <MapPinPlus
            className="h-10 w-10 text-brand opacity-30"
            aria-hidden="true"
          />
          <Skeleton className="h-9 w-52" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-72" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>
      </header>

      {/* ── Tipo de dirección ── */}
      <section
        aria-label="Cargando selector de tipo"
        className="px-6 pt-5 space-y-3"
      >
        <Skeleton className="h-5 w-36" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-16 shrink-0 rounded-xl" />
          ))}
        </div>
      </section>

      {/* ── Campos del formulario ── */}
      <section
        aria-label="Cargando campos de dirección"
        className="px-6 space-y-6 py-4"
      >
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded" />
          <Skeleton className="h-6 w-52" />
        </div>

        {/* businessName */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* street + number */}
        <div className="flex gap-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="w-24 space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>

        {/* neighborhood */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* city */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* info */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-24 w-full rounded-md" />
        </div>

        {/* switches */}
        <div className="flex items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>
        </div>
      </section>

      {/* ── GPS ── */}
      <section
        aria-label="Cargando campos GPS"
        className="border-t bg-muted/30 px-6 py-5 space-y-3"
      >
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </section>

      {/* ── Imagen ── */}
      <section
        aria-label="Cargando campo de imagen"
        className="px-6 py-4 space-y-3"
      >
        <Skeleton className="h-5 w-36" />
        <Skeleton className="aspect-square w-full rounded-2xl" />
      </section>

      {/* ── Botón submit ── */}
      <div className="sticky bottom-0 border-t bg-background px-4 py-3 shadow-md">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}
