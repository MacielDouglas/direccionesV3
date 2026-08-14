"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { I18nDictionary } from "@/lib/i18n/types";
import { BrushCleaning, MapPin, Paperclip, Pin, SatelliteDish } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { AddressFormData } from "../../domain/address.schema";
import { useGeolocation } from "../../hooks/useGeolocation";

const MapboxMap = dynamic(
  () => import("@/features/map/components/MapboxMap").then((m) => m.MapboxMap),
  {
    ssr: false,
    loading: () => <div className="h-80 w-full animate-pulse rounded-xl bg-muted" />,
  },
);

const extractCoords = (value: string) => {
  const cleaned = value.replace(/[()]/g, "").trim();
  const parts = cleaned.split(",").map((s) => s.trim());
  if (parts.length !== 2) return null;
  const lat = Number(parts[0]);
  const lng = Number(parts[1]);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
};

// ── Skeleton com blur quando permissão negada ────────────────────────────────
function GeolocationBlockedOverlay({
  t,
  onRequest,
}: {
  t: I18nDictionary;
  onRequest: () => void;
}) {
  return (
    <output
      aria-label={t.addresses.gpsLocationDisabledAria}
      className="block relative overflow-hidden rounded-xl"
    >
      {/* Mapa borrado como fundo */}
      <div className="h-80 w-full select-none rounded-xl bg-muted" aria-hidden="true">
        <div className="h-full w-full animate-pulse rounded-xl bg-linear-to-br from-muted to-muted-foreground/10" />
      </div>

      {/* Overlay com blur */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl bg-background/70 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-2 text-center px-4">
          <MapPin className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-semibold text-foreground">{t.addresses.gpsBlockedTitle}</p>
          <p className="text-xs text-muted-foreground max-w-xs">{t.addresses.gpsBlockedHint}</p>
        </div>
        <Button type="button" onClick={onRequest}>
          <Pin aria-hidden="true" />
          {t.addresses.gpsEnableLocation}
        </Button>
      </div>
    </output>
  );
}

// ── Skeleton enquanto detecta permissão ─────────────────────────────────────
function GeolocationIdleSkeleton({ t }: { t: I18nDictionary }) {
  return (
    <output
      aria-label={t.addresses.gpsVerifying}
      className="block h-80 w-full animate-pulse rounded-xl bg-muted"
    >
      <span className="sr-only">{t.addresses.gpsCheckingAria}</span>
    </output>
  );
}

// ── Prompt: permissão ainda não solicitada ───────────────────────────────────
function GeolocationPrompt({
  t,
  onRequest,
  loading,
}: {
  t: I18nDictionary;
  onRequest: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex h-80 w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 text-center px-4">
      <MapPin className="h-10 w-10 text-brand" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{t.addresses.gpsPromptTitle}</p>
        <p className="text-xs text-muted-foreground max-w-xs">{t.addresses.gpsPromptHint}</p>
      </div>
      <Button type="button" onClick={onRequest} disabled={loading} aria-busy={loading}>
        <Pin aria-hidden="true" />
        {loading ? t.addresses.gpsRequesting : t.addresses.gpsEnableGps}
      </Button>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function AddressGpsFields() {
  const { t } = useI18n();
  const { setValue, watch } = useFormContext<AddressFormData>();
  const latitude = watch("latitude");
  const longitude = watch("longitude");

  const [error, setError] = useState("");
  const [isFetchingGps, setIsFetchingGps] = useState(false);

  const { state, requestPermission } = useGeolocation();

  const updateGps = useCallback(
    (lat: number, lng: number) => {
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        setError(t.addresses.gpsInvalidCoords);
        return;
      }
      setValue("latitude", lat, { shouldValidate: true });
      setValue("longitude", lng, { shouldValidate: true });
      setError("");
    },
    [setValue, t],
  );

  const handleGetUserLocation = () => {
    requestPermission(
      (lat, lng) => updateGps(lat, lng),
      (msg) => setError(msg),
      setIsFetchingGps,
    );
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const coords = extractCoords(text);
      if (!coords) {
        setError(t.addresses.gpsInvalidFormat);
        return;
      }
      updateGps(coords.lat, coords.lng);
    } catch {
      setError(t.addresses.gpsClipboardError);
    }
  };

  // ── Limpar coordenadas (pin do mapa é limpo automaticamente pelo value=null)
  const handleClear = useCallback(() => {
    setValue("latitude", null, { shouldValidate: true });
    setValue("longitude", null, { shouldValidate: true });
    setError("");
  }, [setValue]);

  const renderMapArea = () => {
    if (state === "idle" || state === "unsupported") return <GeolocationIdleSkeleton t={t} />;
    if (state === "prompt")
      return <GeolocationPrompt t={t} onRequest={handleGetUserLocation} loading={isFetchingGps} />;
    if (state === "denied")
      return <GeolocationBlockedOverlay t={t} onRequest={handleGetUserLocation} />;

    return (
      <MapboxMap
        value={latitude != null && longitude != null ? { latitude, longitude } : null}
        onChange={(coords) => {
          setValue("latitude", coords.latitude);
          setValue("longitude", coords.longitude);
        }}
      />
    );
  };

  return (
    <section aria-labelledby="gps-section-title" className="space-y-4 p-5 sm:p-6">
      <header>
        <h2
          id="gps-section-title"
          className="inline-flex items-baseline gap-1 text-xl font-semibold"
        >
          <SatelliteDish className="h-7 w-7 text-brand" aria-hidden="true" />
          {t.addresses.gpsTitle}
        </h2>
        <p className="text-sm text-muted-foreground">{t.addresses.gpsHint}</p>
      </header>

      <div className="rounded-lg bg-surface-subtle-light text-lg text-center p-3 dark:bg-surface-subtle-dark dark:text-slate-400">
        <p>{t.addresses.gpsTip}</p>
      </div>

      <div className="flex items-center justify-around gap-10">
        <p className="text-sm">
          {t.addresses.gpsLatitude}:{" "}
          <span className="font-mono text-blue-500">{latitude ?? "—"}</span>
        </p>
        <p className="text-sm">
          {t.addresses.gpsLongitude}:{" "}
          <span className="font-mono text-blue-500">{longitude ?? "—"}</span>
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Área do mapa — condicional por estado de permissão */}
      {renderMapArea()}

      {/* Botões só aparecem quando GPS está disponível */}
      {(state === "granted" || state === "prompt") && (
        <div className="mx-auto flex flex-wrap justify-center gap-2 pt-2">
          <Button
            type="button"
            onClick={handleGetUserLocation}
            disabled={isFetchingGps}
            aria-busy={isFetchingGps}
          >
            <Pin aria-hidden="true" />
            {isFetchingGps ? t.addresses.gpsGettingLocation : t.addresses.gpsMyLocation}
          </Button>

          <Button type="button" variant="outline" onClick={handlePaste} disabled={isFetchingGps}>
            <Paperclip aria-hidden="true" />
            {t.addresses.gpsPasteCoords}
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleClear}
            disabled={isFetchingGps}
          >
            <BrushCleaning aria-hidden="true" />
            {t.addresses.gpsClear}
          </Button>
        </div>
      )}
    </section>
  );
}
