"use client";

import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";
import { useMapInstance } from "../core/MapboxProvider";
import type { Coordinates } from "../types/map.types";

export type SelectableAddress = Coordinates & {
  id: string;
  label: string;
  index: number;
};

interface Props {
  addresses: SelectableAddress[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function SelectableAddressesLayer({
  addresses,
  selectedIds,
  onToggle,
}: Props) {
  const { map, isLoaded } = useMapInstance();
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const onToggleRef = useRef(onToggle);

  useEffect(() => {
    onToggleRef.current = onToggle;
  }, [onToggle]);

  //  Cria markers
  useEffect(() => {
    if (!map || !isLoaded || addresses.length === 0) return;

    const markers = markersRef.current;
    markers.forEach((m) => m.remove());
    markers.clear();

    const bounds = new mapboxgl.LngLatBounds();

    addresses.forEach((addr) => {
      const el = createMarkerEl(addr.index); // sempre inicia sem seleção

      el.addEventListener("click", () => onToggleRef.current(addr.id));

      const popup = new mapboxgl.Popup({
        offset: 16,
        closeButton: false,
      }).setText(addr.label);

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([addr.longitude, addr.latitude])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener("mouseenter", () => marker.getPopup()?.addTo(map));
      el.addEventListener("mouseleave", () => marker.getPopup()?.remove());

      markers.set(addr.id, marker);
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
      markers.clear();
    };
  }, [map, isLoaded, addresses]);

  useEffect(() => {
    if (!map || !isLoaded) return;
    addresses.forEach((addr) => {
      const marker = markersRef.current.get(addr.id);
      if (!marker) return;
      applyMarkerStyle(marker.getElement(), selectedIds.includes(addr.id));
    });
  }, [selectedIds, map, isLoaded, addresses]);

  return null;
}

function createMarkerEl(index: number): HTMLElement {
  const el = document.createElement("button");
  el.type = "button";
  el.textContent = String(index);
  el.className = "map-marker map-marker--default";
  return el;
}

function applyMarkerStyle(el: HTMLElement, isSelected: boolean) {
  el.classList.toggle("map-marker--selected", isSelected);
  el.classList.toggle("map-marker--default", !isSelected);
}
