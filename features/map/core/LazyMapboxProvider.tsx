import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const MapboxProviderDynamic = dynamic(
  () => import("./MapboxProvider").then((m) => m.MapboxProvider),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse rounded-xl bg-muted flex items-center justify-center">
        <span className="text-xs text-muted-foreground">Cargando mapa...</span>
      </div>
    ),
  },
);

interface Props {
  children: ReactNode;
  className?: string; // controla a altura/forma do container externo
}

export function LazyMapboxProvider({ children, className }: Props) {
  return (
    <div
      className={`overflow-hidden rounded-xl ${className ?? "h-full w-full"}`}
    >
      <MapboxProviderDynamic>{children}</MapboxProviderDynamic>
    </div>
  );
}
