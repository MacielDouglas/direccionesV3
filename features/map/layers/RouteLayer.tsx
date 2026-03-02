"use client";

import mapboxgl from "mapbox-gl";
import { useMapInstance } from "../core/MapboxProvider";
import { Coordinates, RouteProfile } from "../types/map.types";
import { useEffect, useRef } from "react";

type Props = {
  destination: Coordinates;
  profile: RouteProfile;
};

const SOURCE_ID = "route-source";
const LAYER_ID = "route-layer";

export default function RouteLayer({ destination, profile }: Props) {
  const { map, isLoaded } = useMapInstance();
  const watchIdRef = useRef<number | null>(null);
  const destMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Pin do destino
  useEffect(() => {
    if (!map || !isLoaded) return;

    destMarkerRef.current?.remove();
    destMarkerRef.current = new mapboxgl.Marker({ color: "#ef4444" })
      .setLngLat([destination.longitude, destination.latitude])
      .addTo(map);

    map.flyTo({
      center: [destination.longitude, destination.latitude],
      zoom: 15,
      essential: true,
    });

    return () => {
      destMarkerRef.current?.remove();
    };
  }, [map, isLoaded, destination]);

  // Rota em tempo real
  useEffect(() => {
    if (!map || !isLoaded || !navigator.geolocation) return;

    const drawRoute = async (userCoords: GeolocationCoordinates) => {
      const { longitude: uLng, latitude: uLat } = userCoords;
      const { longitude: dLng, latitude: dLat } = destination;

      // Atualiza marcador do usuário
      userMarkerRef.current?.remove();
      userMarkerRef.current = new mapboxgl.Marker({ color: "#3b82f6" })
        .setLngLat([uLng, uLat])
        .addTo(map);

      // Chama Directions API
      const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${uLng},${uLat};${dLng},${dLat}?geometries=geojson&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`;

      const res = await fetch(url);
      const data = await res.json();
      const routeGeometry = data.routes?.[0]?.geometry;
      if (!routeGeometry) return;

      // Remove layer/source anterior
      if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);

      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: routeGeometry },
      });

      map.addLayer({
        id: LAYER_ID,
        type: "line",
        source: SOURCE_ID,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": profile === "walking" ? "#3b82f6" : "#000000",
          "line-width": 5,
          "line-opacity": 0.85,
        },
      });

      // Fit bounds para mostrar toda a rota
      const coords = routeGeometry.coordinates as [number, number][];
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new mapboxgl.LngLatBounds(coords[0], coords[0]),
      );
      map.fitBounds(bounds, { padding: 60, essential: true });
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => drawRoute(pos.coords),
      (err) => console.warn("Geolocation error:", err),
      { enableHighAccuracy: true },
    );

    return () => {
      if (watchIdRef.current !== null)
        navigator.geolocation.clearWatch(watchIdRef.current);

      userMarkerRef.current?.remove();

      // ✅ Guard: verifica se o mapa ainda está com o estilo carregado
      try {
        if (map.getStyle()) {
          if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
          if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
        }
      } catch {
        // mapa já foi destruído, ignorar silenciosamente
      }
    };
  }, [map, isLoaded, destination, profile]);

  return null;
}
