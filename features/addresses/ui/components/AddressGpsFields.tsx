"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Coordinates } from "@/features/map/types/map.types";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { I18nDictionary } from "@/lib/i18n/types";
import { BrushCleaning, MapPin, Paperclip, Pin, SatelliteDish, XIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { AddressFormData } from "../../domain/address.schema";
import { useGeolocation } from "../../hooks/useGeolocation";

const MapboxMap = dynamic(
  () => import("@/features/map/components/MapboxMap").then((m) => m.MapboxMap),
  {
    ssr: false,
    loading: () => <div className="h-[80svh] w-full animate-pulse rounded-xl bg-muted" />,
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
      <div className="h-full w-full select-none rounded-xl bg-muted" aria-hidden="true">
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
      className="block h-full w-full animate-pulse rounded-xl bg-muted"
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
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 text-center px-4">
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

  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isFetchingGps, setIsFetchingGps] = useState(false);
  const [draft, setDraft] = useState<Coordinates | null>(null);

  const { state, requestPermission } = useGeolocation();

  const updateGps = useCallback(
    (lat: number, lng: number) => {
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        setError(t.addresses.gpsInvalidCoords);
        return;
      }
      setDraft({ latitude: lat, longitude: lng });
      setError("");
    },
    [t],
  );

  const handleGetUserLocation = () => {
    requestPermission(
      (lat, lng) => updateGps(lat, lng),
      (reason) => setError(t.addresses[reason === "unsupported" ? "gpsUnsupported" : "gpsFailed"]),
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

  const handleClear = useCallback(() => {
    setDraft(null);
    setError("");
  }, []);

  const handleConfirm = () => {
    setValue("latitude", draft?.latitude ?? null, { shouldValidate: true });
    setValue("longitude", draft?.longitude ?? null, { shouldValidate: true });
    setOpen(false);
  };

  const renderMapArea = () => {
    if (state === "idle" || state === "unsupported") return <GeolocationIdleSkeleton t={t} />;
    if (state === "prompt")
      return <GeolocationPrompt t={t} onRequest={handleGetUserLocation} loading={isFetchingGps} />;
    if (state === "denied")
      return <GeolocationBlockedOverlay t={t} onRequest={handleGetUserLocation} />;

    return (
      <MapboxMap
        className="h-[80svh]"
        value={draft}
        onChange={(coords) => {
          setDraft({ latitude: coords.latitude, longitude: coords.longitude });
        }}
      />
    );
  };

  const hasGps = latitude != null && longitude != null;

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

      {/* Estado atual da localização */}
      <div className="rounded-xl border border-border bg-surface-subtle-light p-4 dark:bg-surface-subtle-dark">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t.addresses.gpsCurrent}
        </p>
        {hasGps ? (
          <div className="mt-1 flex items-center justify-around gap-4 text-sm">
            <p>
              {t.addresses.gpsLatitude}: <span className="font-mono text-blue-500">{latitude}</span>
            </p>
            <p>
              {t.addresses.gpsLongitude}:{" "}
              <span className="font-mono text-blue-500">{longitude}</span>
            </p>
          </div>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">{t.addresses.gpsNotSet}</p>
        )}
      </div>

      {/* Botão chamativo — abre o modal */}
      <Button
        type="button"
        onClick={() => {
          const lat = latitude ?? null;
          const lng = longitude ?? null;
          setDraft(lat != null && lng != null ? { latitude: lat, longitude: lng } : null);
          setError("");
          setOpen(true);
        }}
        className="w-full rounded-full bg-brand px-5 py-3.5 text-sm font-semibold text-brand-foreground shadow-sm transition-colors hover:bg-brand/90 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <MapPin className="size-4" aria-hidden="true" />
        {t.addresses.gpsSendButton}
      </Button>

      {/* Modal — mapa ocupa 80% da tela */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[calc(100%-1rem)] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-3xl"
        >
          <div className="flex items-center justify-between gap-4 border-b p-4">
            <div>
              <DialogTitle className="text-base sm:text-lg">
                {t.addresses.gpsModalTitle}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                {t.addresses.gpsModalHint}
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button type="button" variant="outline" size="icon" aria-label={t.addresses.gpsClose}>
                <XIcon className="size-4" aria-hidden="true" />
              </Button>
            </DialogClose>
          </div>

          {/* Mapa — 80% da altura da tela */}
          <div className="relative h-[80svh]">
            {renderMapArea()}

            {/* Erro sobreposto ao mapa */}
            {error && (
              <p
                role="alert"
                className="absolute left-3 right-3 top-3 z-10 rounded-lg bg-background/90 px-3 py-2 text-sm text-destructive shadow backdrop-blur-sm"
              >
                {error}
              </p>
            )}
          </div>

          {/* Rodapé — ações */}
          <div className="flex flex-wrap items-center gap-2 border-t p-4">
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

            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isFetchingGps}
              className="ml-auto w-full sm:w-auto"
            >
              <SatelliteDish aria-hidden="true" />
              {t.addresses.gpsConfirmClose}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
