"use client";

import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";
import { useMapInstance } from "../core/MapboxProvider";
import type { Coordinates } from "../types/map.types";

type Props = {
  value?: Coordinates | null;
  onChange?: (coords: Coordinates) => void;
};

export function SelectLocationLayer({ value, onChange }: Props) {
  const { map, isLoaded } = useMapInstance();
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // Click no mapa
  useEffect(() => {
    if (!map || !isLoaded) return;

    const setMarker = (coords: Coordinates) => {
      markerRef.current?.remove();
      markerRef.current = new mapboxgl.Marker({ color: "#ef4444" })
        .setLngLat([coords.longitude, coords.latitude])
        .addTo(map);
    };

    const handler = (e: mapboxgl.MapMouseEvent) => {
      const coords = { latitude: e.lngLat.lat, longitude: e.lngLat.lng };
      setMarker(coords);
      onChange?.(coords);
    };

    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [map, isLoaded, onChange]);

  // Atualização externa (react-hook-form)
  useEffect(() => {
    if (!map || !value) return;

    markerRef.current?.remove();
    markerRef.current = new mapboxgl.Marker({ color: "#ef4444" })
      .setLngLat([value.longitude, value.latitude])
      .addTo(map);
  }, [map, value]);

  return null;
}
