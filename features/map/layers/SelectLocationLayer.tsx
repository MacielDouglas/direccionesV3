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
      // ✅ Centraliza no clique do usuário
      map.flyTo({
        center: [coords.longitude, coords.latitude],
        zoom: Math.max(map.getZoom(), 15),
        essential: true,
        duration: 600,
      });
    };

    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [map, isLoaded, onChange]);

  // ✅ Sincroniza marker externo (colar coords / GPS) E centraliza no pin
  useEffect(() => {
    if (!map || !isLoaded) return;

    markerRef.current?.remove();

    if (value) {
      markerRef.current = new mapboxgl.Marker({ color: "#ef4444" })
        .setLngLat([value.longitude, value.latitude])
        .addTo(map);

      // ✅ Centraliza o mapa no pin vermelho quando value muda externamente
      map.flyTo({
        center: [value.longitude, value.latitude],
        zoom: Math.max(map.getZoom(), 15),
        essential: true,
        duration: 800,
      });
    } else {
      markerRef.current = null;
    }
  }, [map, isLoaded, value]);

  // Cleanup final
  useEffect(() => {
    return () => {
      markerRef.current?.remove();
    };
  }, []);

  return null;
}
