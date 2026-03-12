"use client";

import { LazyMapboxProvider } from "../core/LazyMapboxProvider";
import { SelectLocationLayer } from "../layers/SelectLocationLayer";
import { UserLocationLayer } from "../layers/UserLocationLayer";
import type { Coordinates } from "../types/map.types";

type Props = {
  value?: Coordinates | null;
  onChange?: (coords: Coordinates) => void;
};

export function MapboxMap({ value, onChange }: Props) {
  return (
    <div className="h-80 w-full overflow-hidden rounded-xl">
      <LazyMapboxProvider className="h-80 w-full">
        <UserLocationLayer />
        <SelectLocationLayer value={value} onChange={onChange} />
      </LazyMapboxProvider>
    </div>
  );
}
