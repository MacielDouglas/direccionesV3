"use client";

import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";
import { useMapInstance } from "../core/MapboxProvider";

export type GroupedAddress = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  cardId: string;
  cardNumber: number;
  color: string;
};

interface Props {
  addresses: GroupedAddress[];
  selectedCardId: string | null;
  selectedAddressId: string | null;
  onAddressClick: (addressId: string, cardId: string) => void;
}

export function CardGroupedLayer({
  addresses,
  selectedCardId,
  selectedAddressId,
  onAddressClick,
}: Props) {
  const { map, isLoaded } = useMapInstance();
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const popupsRef = useRef<Map<string, mapboxgl.Popup>>(new Map());
  const onClickRef = useRef(onAddressClick);

  useEffect(() => {
    onClickRef.current = onAddressClick;
  }, [onAddressClick]);

  // Cria markers — fitBounds só aqui
  useEffect(() => {
    if (!map || !isLoaded || addresses.length === 0) return;

    const markers = markersRef.current;
    const popups = popupsRef.current;

    markers.forEach((m) => m.remove());
    popups.forEach((p) => p.remove());
    markers.clear();
    popups.clear();

    const bounds = new mapboxgl.LngLatBounds();

    addresses.forEach((addr) => {
      const el = createGroupedMarkerEl(addr.cardNumber, addr.color, true);
      const inner = el.firstElementChild as HTMLElement;

      inner.addEventListener("click", () => {
        onClickRef.current(addr.id, addr.cardId);
      });

      const popup = new mapboxgl.Popup({
        offset: 30,
        closeButton: false,
        className: "card-address-popup",
        maxWidth: "200px",
      }).setHTML(`
        <div style="
          background:${addr.color};
          color:white;
          padding:6px 10px;
          border-radius:6px;
          font-size:12px;
          font-weight:600;
          white-space:nowrap;
          max-width:180px;
          overflow:hidden;
          text-overflow:ellipsis;
        ">
          #${String(addr.cardNumber).padStart(2, "0")} — ${addr.label}
        </div>
      `);

      inner.addEventListener("mouseenter", () => popup.addTo(map));
      inner.addEventListener("mouseleave", () => popup.remove());

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([addr.longitude, addr.latitude])
        .setPopup(popup)
        .addTo(map);

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
      map.fitBounds(bounds, { padding: 60, maxZoom: 16, essential: true });
    }

    return () => {
      markers.forEach((m) => m.remove());
      popups.forEach((p) => p.remove());
      markers.clear();
      popups.clear();
    };
  }, [map, isLoaded, addresses]);

  // Opacidade por card selecionado
  useEffect(() => {
    if (!map || !isLoaded) return;

    markersRef.current.forEach((marker, addressId) => {
      const addr = addresses.find((a) => a.id === addressId);
      if (!addr) return;

      const inner = marker.getElement().firstElementChild as HTMLElement | null;
      if (!inner) return;

      const isCardSelected =
        selectedCardId === null || addr.cardId === selectedCardId;

      inner.style.opacity = isCardSelected ? "1" : "0.25";
      inner.style.transition =
        "opacity 200ms ease, transform 200ms ease, background-color 150ms ease";
    });
  }, [selectedCardId, map, isLoaded, addresses]);

  // Highlight preto — todos os pins do card selecionado
  useEffect(() => {
    if (!map || !isLoaded) return;

    const selectedAddr = addresses.find((a) => a.id === selectedAddressId);
    const highlightedCardId = selectedAddr?.cardId ?? null;

    markersRef.current.forEach((marker, addressId) => {
      const addr = addresses.find((a) => a.id === addressId);
      if (!addr) return;

      const inner = marker.getElement().firstElementChild as HTMLElement | null;
      if (!inner) return;

      const isHighlighted =
        highlightedCardId !== null && addr.cardId === highlightedCardId;

      inner.style.backgroundColor = isHighlighted ? "#000000" : addr.color;
      inner.style.transform = isHighlighted ? "scale(1.2)" : "scale(1)";
    });
  }, [selectedAddressId, map, isLoaded, addresses]);

  return null;
}

// ← apenas UMA declaração desta função
function createGroupedMarkerEl(
  cardNumber: number,
  color: string,
  active: boolean,
): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
    position: absolute;
    width: 30px;
    height: 30px;
    pointer-events: none;
  `;

  const inner = document.createElement("div");
  inner.textContent = String(cardNumber).padStart(2, "0");
  inner.style.cssText = `
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 2.5px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    color: white;
    cursor: pointer;
    pointer-events: auto;
    box-shadow: 0 2px 8px rgba(0,0,0,0.35);
    transition: opacity 200ms ease, transform 200ms ease, background-color 150ms ease;
    background-color: ${color};
    opacity: ${active ? "1" : "0.25"};
    transform: ${active ? "scale(1)" : "scale(0.85)"};
  `;

  wrapper.appendChild(inner);
  return wrapper;
}