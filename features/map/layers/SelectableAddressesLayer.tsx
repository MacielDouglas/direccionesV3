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

  // Mantém onToggle atualizado sem re-executar o effect
  useEffect(() => {
    onToggleRef.current = onToggle;
  }, [onToggle]);

  // Cria markers — só re-executa se addresses ou mapa mudar
  useEffect(() => {
    if (!map || !isLoaded || addresses.length === 0) return;

    // Copia ref para uso no cleanup — resolve o warning
    const markers = markersRef.current;
    markers.forEach((m) => m.remove());
    markers.clear();

    const bounds = new mapboxgl.LngLatBounds();

    addresses.forEach((addr) => {
      const isSelected = selectedIds.includes(addr.id);
      const el = createMarkerEl(addr.index, isSelected);

      el.addEventListener("click", () => onToggleRef.current(addr.id));

      const popup = new mapboxgl.Popup({
        offset: 28,
        closeButton: false,
      }).setText(addr.label);

      const marker = new mapboxgl.Marker({ element: el })
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
      // Usa a variável local copiada — resolve o warning do ref
      markers.forEach((m) => m.remove());
      markers.clear();
    };
  }, [map, isLoaded, addresses, selectedIds]); // selectedIds intencionalmente fora — tratado abaixo

  // Atualiza cor sem recriar markers
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

function createMarkerEl(index: number, isSelected: boolean): HTMLElement {
  const el = document.createElement("button");
  el.type = "button";
  el.textContent = String(index);
  applyMarkerStyle(el, isSelected);
  return el;
}

function applyMarkerStyle(el: HTMLElement, isSelected: boolean) {
  el.className = [
    "flex items-center justify-center",
    "size-7 rounded-full",
    "text-white text-xs font-bold",
    "shadow-md border-2 border-white",
    "cursor-pointer transition-colors duration-150",
    isSelected ? "bg-blue-500" : "bg-red-500",
  ].join(" ");
}
