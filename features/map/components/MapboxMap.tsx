"use client";

import { LazyMapboxProvider } from "../core/LazyMapboxProvider";
import { SelectLocationLayer } from "../layers/SelectLocationLayer";
import { UserLocationLayer } from "../layers/UserLocationLayer";
import type { Coordinates } from "../types/map.types";

type Props = {
  value?: Coordinates | null;
  onChange?: (coords: Coordinates) => void;
  className?: string;
};

export function MapboxMap({ value, onChange, className = "h-80" }: Props) {
  return (
    <div className={`w-full overflow-hidden rounded-xl ${className}`}>
      <LazyMapboxProvider className={className}>
        <UserLocationLayer />
        <SelectLocationLayer value={value} onChange={onChange} />
      </LazyMapboxProvider>
    </div>
  );
}
