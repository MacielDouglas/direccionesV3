"use client";

import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";
import { useMapInstance } from "../core/MapboxProvider";
import type { Coordinates } from "../types/map.types";

export type CardAddress = Coordinates & {
  id: string;
  label: string;
};

interface Props {
  addresses: CardAddress[];
  onMarkerClick?: (id: string) => void;
  showLabels?: boolean;
}

export function CardAddressesLayer({
  addresses,
  onMarkerClick,
  showLabels = false,
}: Props) {
  const { map, isLoaded } = useMapInstance();
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const popupsRef = useRef<Map<string, mapboxgl.Popup>>(new Map());
  const onMarkerClickRef = useRef(onMarkerClick);

  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  // Cria markers
  useEffect(() => {
    if (!map || !isLoaded || addresses.length === 0) return;

    const markers = markersRef.current;
    const popups = popupsRef.current;

    markers.forEach((m) => m.remove());
    popups.forEach((p) => p.remove());
    markers.clear();
    popups.clear();

    const bounds = new mapboxgl.LngLatBounds();

    addresses.forEach((addr, index) => {
      const el = createMarkerEl(index + 1);

      if (onMarkerClickRef.current) {
        el.addEventListener("click", () => onMarkerClickRef.current!(addr.id));
        el.style.cursor = "pointer";
      }

      const popup = new mapboxgl.Popup({
        offset: 28,
        closeButton: false,
        className: "card-address-popup",
      }).setText(addr.label);

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([addr.longitude, addr.latitude])
        .setPopup(popup)
        .addTo(map);

      // Hover
      el.addEventListener("mouseenter", () => popup.addTo(map));
      el.addEventListener("mouseleave", () => {
        if (!showLabels) popup.remove();
      });

      markers.set(addr.id, marker);
      popups.set(addr.id, popup);
      bounds.extend([addr.longitude, addr.latitude]);
    });

    if (addresses.length === 1) {
      map.flyTo({
        center: [addresses[0].longitude, addresses[0].latitude],
        zoom: 15,
      });
    } else {
      map.fitBounds(bounds, { padding: 60, essential: true });
    }

    return () => {
      markers.forEach((m) => m.remove());
      popups.forEach((p) => p.remove());
      markers.clear();
      popups.clear();
    };
  }, [map, isLoaded, addresses, showLabels]);

  // Controla labels fixos quando showLabels muda
  useEffect(() => {
    if (!map || !isLoaded) return;

    popupsRef.current.forEach((popup) => {
      if (showLabels) {
        popup.addTo(map);
      } else {
        popup.remove();
      }
    });
  }, [showLabels, map, isLoaded]);

  return null;
}

function createMarkerEl(index: number): HTMLElement {
  const el = document.createElement("div");
  el.textContent = String(index);
  el.className = "map-marker map-marker--default";
  return el;
}
