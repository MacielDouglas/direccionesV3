"use client";

import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";
import { useMapInstance } from "../core/MapboxProvider";

export function UserLocationLayer() {
  const { map, isLoaded } = useMapInstance();
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!map || !isLoaded || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      markerRef.current = new mapboxgl.Marker({
        color: "#3b82f6",
      })
        .setLngLat([pos.coords.longitude, pos.coords.latitude])
        .addTo(map);

      // ✅ mover o mapa até o usuário
      map.flyTo({
        center: [pos.coords.longitude, pos.coords.latitude],
        zoom: 16,
        essential: true,
      });
    });

    return () => {
      markerRef.current?.remove();
    };
  }, [map, isLoaded]);

  return null;
}
