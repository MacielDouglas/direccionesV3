"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import type { I18nDictionary } from "@/lib/i18n/types";
import mapboxgl from "mapbox-gl";
import { useCallback, useEffect, useRef, useState } from "react";
import ConfirmModal from "./ConfirmModal";
import PinControls from "./PinControls";

import {
  cancelSurveyPinAction,
  confirmSurveyPinAction,
  createSurveyPinsAction,
} from "../../application/survey.action";
import type { PinStatus, SurveyPin } from "../../types/survey.types";

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
  personId: string;
  userRole: string;
  initialPins: SurveyPin[];
}

const PIN_COLORS: Record<PinStatus, string> = {
  PENDING: "#ef4444",
  SUGGESTED: "#eab308",
  CONFIRMED: "#22c55e",
  CANCELLED: "#9ca3af",
};

const PIN_STATUS_KEY: Record<PinStatus, keyof I18nDictionary["survey"]> = {
  PENDING: "pending",
  SUGGESTED: "suggested",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
};

export default function SurveyMap({ organizationId, userRole, initialPins }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const serverMarkersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  // flag: indica se o próximo click no mapa deve ser ignorado (veio de marker)
  const suppressClickRef = useRef(false);

  const { t } = useI18n();

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

  // ── Confirmar pin do servidor ────────────────────────────────────────────
  const handleConfirmSinglePin = useCallback(
    async (pinId: string) => {
      setLoading(true);
      try {
        const result = await confirmSurveyPinAction(pinId, organizationId);
        if (result.success) {
          setServerPins((prev) =>
            prev.map((p) => (p.id === pinId ? { ...p, status: "CONFIRMED" } : p)),
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [organizationId],
  );

  // ── Cancelar pin do servidor ─────────────────────────────────────────────
  const handleCancelPin = useCallback(
    async (pinId: string) => {
      setLoading(true);
      try {
        const result = await cancelSurveyPinAction(pinId, organizationId);
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
    },
    [organizationId],
  );

  // ── Remove pin local ─────────────────────────────────────────────────────
  const removeLocalPin = useCallback((tmpId: string) => {
    setLocalPins((prev) => {
      const pin = prev.find((p) => p.tmpId === tmpId);
      pin?.marker.remove();
      return prev.filter((p) => p.tmpId !== tmpId);
    });
  }, []);

  // Refs estáveis para uso em efeitos (evita dep em useCallback estável)
  const handlersRef = useRef({ handleConfirmSinglePin, handleCancelPin, removeLocalPin });
  handlersRef.current = { handleConfirmSinglePin, handleCancelPin, removeLocalPin };

  // ── Renderiza pins do servidor ───────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    for (const m of serverMarkersRef.current.values()) m.remove();
    serverMarkersRef.current.clear();

    for (const pin of serverPins) {
      if (pin.status === "CANCELLED") continue;

      const el = createPinElement(PIN_COLORS[pin.status], t.survey.pinAria);

      const canConfirm = pin.status === "SUGGESTED";
      const canCancel =
        pin.status === "CONFIRMED" || pin.status === "SUGGESTED" || pin.status === "PENDING";

      const popup = new mapboxgl.Popup({ offset: 25, maxWidth: "200px" }).setDOMContent(
        buildServerPopupContent(t, pin, canConfirm, canCancel, {
          onConfirm: () => handlersRef.current.handleConfirmSinglePin(pin.id),
          onCancel: () => handlersRef.current.handleCancelPin(pin.id),
        }),
      );

      // ← Suprime o click no mapa ao clicar no marker
      el.addEventListener("click", () => {
        suppressClickRef.current = true;
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([pin.longitude, pin.latitude])
        .setPopup(popup)
        .addTo(map);

      serverMarkersRef.current.set(pin.id, marker);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverPins, t]);

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
      const el = createPinElement("#ef4444", t.survey.pinAria);

      const popup = new mapboxgl.Popup({ offset: 25, maxWidth: "160px" }).setDOMContent(
        buildLocalPopupContent(t, { onRemove: () => handlersRef.current.removeLocalPin(tmpId) }),
      );

      // ← Suprime também o click no pin local
      el.addEventListener("click", () => {
        suppressClickRef.current = true;
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      setLocalPins((prev) => [...prev, { tmpId, latitude: lat, longitude: lng, marker }]);
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

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
        for (const { marker } of localPins) marker.remove();
        setLocalPins([]);
        setShowConfirmModal(false);
        setIsAddingMode(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearLocalPins = () => {
    for (const { marker } of localPins) marker.remove();
    setLocalPins([]);
  };

  return (
    <>
      <div
        ref={mapContainerRef}
        className="h-full w-full"
        role="application"
        aria-label={t.survey.mapAria}
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

function createPinElement(color: string, ariaLabel: string): HTMLDivElement {
  const el = document.createElement("div");
  el.setAttribute("role", "img");
  el.setAttribute("aria-label", ariaLabel);
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

function popupButton(label: string, className: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.className = `w-full cursor-pointer rounded-md border-none px-2.5 py-1.5 text-xs font-semibold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`;
  button.addEventListener("click", onClick);
  return button;
}

function buildServerPopupContent(
  t: I18nDictionary,
  pin: SurveyPin,
  canConfirm: boolean,
  canCancel: boolean,
  handlers: { onConfirm: () => void; onCancel: () => void },
): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "px-1 py-0.5 text-sm";

  const name = document.createElement("p");
  name.className = "m-0 font-semibold text-foreground";
  name.textContent = pin.createdBy?.name ?? "—";

  const status = document.createElement("p");
  status.className = "mb-2 text-xs text-muted-foreground";
  status.textContent = t.survey[PIN_STATUS_KEY[pin.status]];

  const actions = document.createElement("div");
  actions.className = "flex flex-col gap-1.5";

  if (canConfirm)
    actions.appendChild(popupButton(t.survey.confirmPin, "bg-green-600", handlers.onConfirm));
  if (canCancel)
    actions.appendChild(popupButton(t.survey.cancelPin, "bg-red-600", handlers.onCancel));

  wrap.append(name, status, actions);
  return wrap;
}

function buildLocalPopupContent(
  t: I18nDictionary,
  handlers: { onRemove: () => void },
): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "px-1 py-0.5 text-sm";

  const title = document.createElement("p");
  title.className = "mb-2 font-semibold text-foreground";
  title.textContent = t.survey.localPin;

  const actions = document.createElement("div");
  actions.className = "flex flex-col gap-1.5";
  actions.appendChild(popupButton(t.survey.removePin, "bg-red-600", handlers.onRemove));

  wrap.append(title, actions);
  return wrap;
}
