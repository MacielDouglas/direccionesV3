"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import PinControls from "./PinControls";
import ConfirmModal from "./ConfirmModal";

import type { SurveyPin, PinStatus } from "../../types/survey.types";
import {
  cancelSurveyPinAction,
  confirmSurveyPinAction,
  createSurveyPinsAction,
} from "../../application/survey.action";

const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (!token) {
  throw new Error("NEXT_PUBLIC_MAPBOX_TOKEN is not configured.");
}

mapboxgl.accessToken = token;

interface LocalPin {
  tmpId: string;
  latitude: number;
  longitude: number;
  marker: mapboxgl.Marker;
}

interface Props {
  organizationId: string;
  userId: string;
  userRole: string;
  initialPins: SurveyPin[];
}

const PIN_COLORS: Record<PinStatus, string> = {
  PENDING: "#ef4444",
  SUGGESTED: "#eab308",
  CONFIRMED: "#22c55e",
  CANCELLED: "#9ca3af",
};

const STATUS_LABEL: Record<PinStatus, string> = {
  PENDING: "Pendiente",
  SUGGESTED: "Sugerido",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
};

export default function SurveyMap({
  organizationId,
  userRole,
  initialPins,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const serverMarkersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  // flag: indica se o próximo click no mapa deve ser ignorado (veio de marker)
  const suppressClickRef = useRef(false);

  const [localPins, setLocalPins] = useState<LocalPin[]>([]);
  const [serverPins, setServerPins] = useState<SurveyPin[]>(initialPins);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAdminOrOwner = userRole === "admin" || userRole === "owner";

  // ── Inicializa mapa ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      zoom: 15,
      center: [-35.0, -8.3],
    });

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
    });

    map.addControl(geolocate, "bottom-right");
    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    map.on("load", () => geolocate.trigger());

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Renderiza pins do servidor ───────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    serverMarkersRef.current.forEach((m) => m.remove());
    serverMarkersRef.current.clear();

    serverPins.forEach((pin) => {
      if (pin.status === "CANCELLED") return;

      const el = createPinElement(PIN_COLORS[pin.status]);

      const canConfirm = pin.status === "SUGGESTED";
      const canCancel =
        pin.status === "CONFIRMED" ||
        pin.status === "SUGGESTED" ||
        pin.status === "PENDING";

      const popup = new mapboxgl.Popup({ offset: 25, maxWidth: "200px" })
        .setHTML(`
        <div style="font-size:13px;padding:4px 2px">
          <p style="font-weight:600;margin:0 0 2px 0;color:#111">${pin.createdBy?.name ?? "—"}</p>
          <p style="margin:0 0 8px 0;font-size:11px;color:#6b7280">${STATUS_LABEL[pin.status]}</p>
          <div style="display:flex;flex-direction:column;gap:6px">
            ${
              canConfirm
                ? `
              <button onclick="window.__surveyAction('confirm','${pin.id}')"
                style="background:#16a34a;color:#fff;border:none;border-radius:6px;
                       padding:6px 10px;cursor:pointer;font-size:12px;font-weight:600;width:100%">
                ✅ Confirmar pin
              </button>`
                : ""
            }
            ${
              canCancel
                ? `
              <button onclick="window.__surveyAction('cancel','${pin.id}')"
                style="background:#dc2626;color:#fff;border:none;border-radius:6px;
                       padding:6px 10px;cursor:pointer;font-size:12px;font-weight:600;width:100%">
                ✕ Cancelar pin
              </button>`
                : ""
            }
          </div>
        </div>
      `);

      // ← Suprime o click no mapa ao clicar no marker
      el.addEventListener("click", () => {
        suppressClickRef.current = true;
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([pin.longitude, pin.latitude])
        .setPopup(popup)
        .addTo(map);

      serverMarkersRef.current.set(pin.id, marker);
    });
  }, [serverPins]);

  // ── Ações globais para popups HTML ──────────────────────────────────────
  useEffect(() => {
    window.__surveyAction = (action, pinId) => {
      if (action === "confirm") handleConfirmSinglePin(pinId);
      if (action === "cancel") handleCancelPin(pinId);
    };

    window.__removeLocalPin = (tmpId) => {
      setLocalPins((prev) => {
        const pin = prev.find((p) => p.tmpId === tmpId);
        pin?.marker.remove();
        return prev.filter((p) => p.tmpId !== tmpId);
      });
    };

    return () => {
      window.__surveyAction = () => {};
      window.__removeLocalPin = () => {};
    };
  });

  // ── Click no mapa ────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      // Se o click veio de um marker, ignora e reseta a flag
      if (suppressClickRef.current) {
        suppressClickRef.current = false;
        return;
      }

      const { lng, lat } = e.lngLat;
      const tmpId = crypto.randomUUID();
      const el = createPinElement("#ef4444");

      const popup = new mapboxgl.Popup({ offset: 25, maxWidth: "160px" })
        .setHTML(`
        <div style="font-size:13px;padding:4px 2px">
          <p style="font-weight:600;margin:0 0 6px 0;color:#111">Pin local</p>
          <button onclick="window.__removeLocalPin('${tmpId}')"
            style="background:#dc2626;color:#fff;border:none;border-radius:6px;
                   padding:6px 10px;cursor:pointer;font-size:12px;font-weight:600;width:100%">
            ✕ Remover pin
          </button>
        </div>
      `);

      // ← Suprime também o click no pin local
      el.addEventListener("click", () => {
        suppressClickRef.current = true;
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      setLocalPins((prev) => [
        ...prev,
        { tmpId, latitude: lat, longitude: lng, marker },
      ]);
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, []);

  // ── Confirmar pin do servidor ────────────────────────────────────────────
  const handleConfirmSinglePin = useCallback(async (pinId: string) => {
    setLoading(true);
    try {
      const result = await confirmSurveyPinAction(pinId);
      if (result.success) {
        setServerPins((prev) =>
          prev.map((p) => (p.id === pinId ? { ...p, status: "CONFIRMED" } : p)),
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Cancelar pin do servidor ─────────────────────────────────────────────
  const handleCancelPin = useCallback(async (pinId: string) => {
    setLoading(true);
    try {
      const result = await cancelSurveyPinAction(pinId);
      if (result.success) {
        setServerPins((prev) =>
          prev.map((p) => (p.id === pinId ? { ...p, status: "CANCELLED" } : p)),
        );
        const marker = serverMarkersRef.current.get(pinId);
        marker?.remove();
        serverMarkersRef.current.delete(pinId);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Salvar pins locais como CONFIRMED ou SUGGESTED ───────────────────────
  const handleSavePins = async () => {
    if (!localPins.length) return;
    setLoading(true);

    const status = isAddingMode && isAdminOrOwner ? "SUGGESTED" : "CONFIRMED";

    try {
      const result = await createSurveyPinsAction({
        organizationId,
        pins: localPins.map(({ latitude, longitude }) => ({
          latitude,
          longitude,
        })),
        status,
      });

      if (result.success) {
        setServerPins((prev) => [...prev, ...result.data]);
        localPins.forEach(({ marker }) => marker.remove());
        setLocalPins([]);
        setShowConfirmModal(false);
        setIsAddingMode(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearLocalPins = () => {
    localPins.forEach(({ marker }) => marker.remove());
    setLocalPins([]);
  };

  return (
    <>
      <div
        ref={mapContainerRef}
        className="h-full w-full"
        role="application"
        aria-label="Mapa interactivo de relevamiento"
      />

      <PinControls
        localPinsCount={localPins.length}
        isAdminOrOwner={isAdminOrOwner}
        isAddingMode={isAddingMode}
        loading={loading}
        onToggleAddingMode={() => setIsAddingMode((v) => !v)}
        onOpenConfirmModal={() => setShowConfirmModal(true)}
        onClearLocalPins={handleClearLocalPins}
      />

      {showConfirmModal && (
        <ConfirmModal
          pinsCount={localPins.length}
          isSuggested={isAddingMode && isAdminOrOwner}
          loading={loading}
          onConfirm={handleSavePins}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </>
  );
}

function createPinElement(color: string): HTMLDivElement {
  const el = document.createElement("div");
  el.setAttribute("role", "img");
  el.setAttribute("aria-label", "Pin de ubicación");
  el.style.cssText = `
    width: 26px;
    height: 26px;
    background-color: ${color};
    border: 3px solid white;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 2px 8px rgba(0,0,0,0.35);
    cursor: pointer;
    transition: transform 0.15s ease;
  `;
  return el;
}
