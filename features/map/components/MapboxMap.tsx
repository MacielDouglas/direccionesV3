"use client";

import { MapboxProvider } from "../core/MapboxProvider";
import { SelectLocationLayer } from "../layers/SelectLocationLayer";
import { UserLocationLayer } from "../layers/UserLocationLayer";
import { Coordinates } from "../types/map.types";

type Props = {
  value?: Coordinates | null;
  onChange?: (coords: Coordinates) => void;
};

export function MapboxMap({ value, onChange }: Props) {
  return (
    <div className="w-full h-80 rounded-xl overflow-hidden">
      <MapboxProvider>
        <UserLocationLayer />
        <SelectLocationLayer value={value} onChange={onChange} />
      </MapboxProvider>
    </div>
  );
}
