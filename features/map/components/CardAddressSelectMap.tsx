"use client";

import { useCallback } from "react";
import { MapboxProvider } from "../core/MapboxProvider";
import { SelectableAddressesLayer } from "../layers/SelectableAddressesLayer";
import { UserLocationLayer } from "../layers/UserLocationLayer";
import type { SelectableAddress } from "../layers/SelectableAddressesLayer";

interface Props {
  addresses: SelectableAddress[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function CardAddressSelectMap({
  addresses,
  selectedIds,
  onToggle,
}: Props) {
  const validAddresses = addresses.filter(
    (a) => a.latitude != null && a.longitude != null,
  );

  const handleToggle = useCallback(
    (id: string) => {
      onToggle(id);
    },
    [onToggle],
  );

  if (validAddresses.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center bg-muted text-sm text-muted-foreground">
        Sin coordenadas disponibles para mostrar en el mapa
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <MapboxProvider>
        <UserLocationLayer />
        <SelectableAddressesLayer
          addresses={validAddresses}
          selectedIds={selectedIds}
          onToggle={handleToggle}
        />
      </MapboxProvider>
    </div>
  );
}
