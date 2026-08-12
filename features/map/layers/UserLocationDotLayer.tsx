"use client";

import mapboxgl from "mapbox-gl";
import { useEffect } from "react";
import { useMapInstance } from "../core/MapboxProvider";

// Converte metros de precisão em pixels no zoom atual do mapa.
function accuracyToPx(map: mapboxgl.Map, lng: number, lat: number, meters: number) {
  const center = map.project([lng, lat]);
  const north = map.project([lng, lat + meters / 111_320]);
  return Math.max(Math.abs(center.y - north.y), 2);
}

export function UserLocationDotLayer() {
  const { map, isLoaded } = useMapInstance();

  useEffect(() => {
    if (!map || !isLoaded || !navigator.geolocation) return;

    let marker: mapboxgl.Marker | null = null;
    let ring: HTMLDivElement | null = null;
    let position: { lng: number; lat: number; accuracy: number } | null = null;

    const updateRing = () => {
      if (!position || !ring) return;
      const px = accuracyToPx(map, position.lng, position.lat, position.accuracy);
      ring.style.width = `${px * 2}px`;
      ring.style.height = `${px * 2}px`;
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lng = pos.coords.longitude;
        const lat = pos.coords.latitude;
        position = { lng, lat, accuracy: pos.coords.accuracy };

        const el = document.createElement("div");
        el.style.cssText = "position: relative; width: 0; height: 0;";

        ring = document.createElement("div");
        ring.style.cssText = [
          "position:absolute",
          "left:50%",
          "top:50%",
          "transform: translate(-50%, -50%)",
          "border-radius:9999px",
          "background-color: rgba(59,130,246,0.15)",
          "border: 1px solid rgba(59,130,246,0.4)",
          "pointer-events:none",
        ].join(";");
        updateRing();

        const dot = document.createElement("div");
        dot.className = "user-location-dot";
        dot.style.cssText =
          "position:absolute; left:50%; top:50%; transform: translate(-50%, -50%);";

        el.appendChild(ring);
        el.appendChild(dot);

        marker = new mapboxgl.Marker({ element: el, anchor: "center" })
          .setLngLat([lng, lat])
          .addTo(map);

        map.on("move", updateRing);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );

    return () => {
      if (marker && position) {
        map.off("move", updateRing);
        marker.remove();
        marker = null;
      }
    };
  }, [map, isLoaded]);

  return null;
}
