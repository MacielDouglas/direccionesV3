"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";

const MapboxProviderDynamic = dynamic(
  () => import("./MapboxProvider").then((m) => m.MapboxProvider),
  { ssr: false },
);

interface Props {
  children: React.ReactNode;
  className?: string;
  center?: { latitude: number; longitude: number };
  zoom?: number;
}

export function LazyMapboxProvider({
  children,
  className,
  center,
  zoom = 14,
}: Props) {
  const [active, setActive] = useState(false);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const staticUrl =
    center && token
      ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${center.longitude},${center.latitude},${zoom}/600x400?access_token=${token}`
      : null;

  if (!active && staticUrl) {
    return (
      <button
        type="button"
        onClick={() => setActive(true)}
        className={`relative w-full ${className}`}
        aria-label="Activar mapa interactivo"
      >
        {/* imagem estática */}
        <div className="relative h-full w-full">
          <Image
            src={staticUrl}
            alt="Vista previa del mapa"
            width={600}
            height={400}
            priority // ✅ mais importante que loading="eager"
            className="h-full w-full object-cover"
          />
        </div>

        {/* overlay UX */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-semibold shadow">
            Tocar para interactuar
          </span>
        </div>
      </button>
    );
  }

  return (
    <div className={`h-full w-full ${className}`}>
      <MapboxProviderDynamic>{children}</MapboxProviderDynamic>
    </div>
  );
}

// import dynamic from "next/dynamic";
// import type { ReactNode } from "react";

// const MapboxProviderDynamic = dynamic(
//   () => import("./MapboxProvider").then((m) => m.MapboxProvider),
//   {
//     ssr: false,
//     loading: () => (
//       <div className="h-full w-full animate-pulse rounded-xl bg-muted flex items-center justify-center">
//         <span className="text-xs text-muted-foreground">Cargando mapa...</span>
//       </div>
//     ),
//   },
// );

// interface Props {
//   children: ReactNode;
//   className?: string; // controla a altura/forma do container externo
// }

// export function LazyMapboxProvider({ children, className }: Props) {
//   return (
//     <div
//       className={`overflow-hidden rounded-xl ${className ?? "h-full w-full"}`}
//     >
//       <MapboxProviderDynamic>{children}</MapboxProviderDynamic>
//     </div>
//   );
// }
