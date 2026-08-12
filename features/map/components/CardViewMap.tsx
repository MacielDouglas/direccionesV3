"use client";

import { Tag } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { LazyMapboxProvider } from "../core/LazyMapboxProvider";
import { type CardAddress, CardAddressesLayer } from "../layers/CardAddressesLayer";
import { UserLocationDotLayer } from "../layers/UserLocationDotLayer";

interface Props {
  addresses: CardAddress[];
  onMarkerClick?: (id: string) => void;
  className?: string;
}

export function CardViewMap({ addresses, onMarkerClick, className }: Props) {
  const [showLabels, setShowLabels] = useState(false);

  const validAddresses = addresses.filter((a) => a.latitude != null && a.longitude != null);

  if (validAddresses.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border text-sm text-muted-foreground">
        Sin coordenadas disponibles
      </div>
    );
  }

  return (
    <div className={className ?? "relative h-64 w-full overflow-hidden rounded-xl shadow-sm"}>
      <LazyMapboxProvider className="h-full">
        <CardAddressesLayer
          addresses={validAddresses}
          onMarkerClick={onMarkerClick}
          showLabels={showLabels}
        />
        <UserLocationDotLayer />
      </LazyMapboxProvider>

      {/* Botão toggle labels */}
      <button
        type="button"
        onClick={() => setShowLabels((v) => !v)}
        aria-pressed={showLabels}
        aria-label={showLabels ? "Ocultar etiquetas" : "Mostrar etiquetas"}
        className={cn(
          "absolute bottom-3 right-3 z-10",
          "flex items-center gap-1.5 rounded-full px-3 py-1.5",
          "text-xs font-semibold shadow-md transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          showLabels
            ? "bg-blue-600 text-white"
            : "bg-background/90 text-foreground backdrop-blur-sm hover:bg-background",
        )}
      >
        <Tag className="size-3.5 shrink-0 " aria-hidden />
        <span className="hidden sm:inline">
          {showLabels ? "Ocultar nombres" : "Mostrar nombres"}
        </span>
        <span className="sm:hidden">{showLabels ? "Ocultar" : "Nombres"}</span>
      </button>
    </div>
  );
}
