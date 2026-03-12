"use client";

import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { BrushCleaning, Paperclip, Pin, SatelliteDish } from "lucide-react";
import type { AddressFormData } from "../../domain/address.schema";
import dynamic from "next/dynamic";

const MapboxMap = dynamic(
  () => import("@/features/map/components/MapboxMap").then((m) => m.MapboxMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 w-full animate-pulse rounded-xl bg-muted" />
    ),
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

export default function AddressGpsFields() {
  const { setValue, watch } = useFormContext<AddressFormData>();
  const latitude = watch("latitude");
  const longitude = watch("longitude");

  const [error, setError] = useState("");
  const [isFetchingGps, setIsFetchingGps] = useState(false);

  const updateGps = useCallback(
    (lat: number, lng: number) => {
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        setError("Coordenadas inválidas.");
        return;
      }
      setValue("latitude", lat, { shouldValidate: true });
      setValue("longitude", lng, { shouldValidate: true });
      setError("");
    },
    [setValue],
  );

  const handleGetUserLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocalización no soportada en este dispositivo.");
      return;
    }

    setIsFetchingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateGps(pos.coords.latitude, pos.coords.longitude);
        setIsFetchingGps(false);
      },
      () => {
        setError("No fue posible obtener tu ubicación.");
        setIsFetchingGps(false);
      },
      { enableHighAccuracy: true },
    );
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const coords = extractCoords(text);
      if (!coords) {
        setError("Formato inválido. Usa: lat, lng");
        return;
      }
      updateGps(coords.lat, coords.lng);
    } catch {
      setError("No se pudo acceder al portapapeles.");
    }
  };

  const handleClear = () => {
    setValue("latitude", null, { shouldValidate: true });
    setValue("longitude", null, { shouldValidate: true });
    setError("");
  };

  return (
    <section className="space-y-4 border-b p-5 dark:bg-surface-elevated-dark">
      <header>
        <h2 className="inline-flex items-baseline gap-1 text-xl font-semibold">
          <SatelliteDish className="h-7 w-7 text-brand" aria-hidden="true" />
          Ubicación GPS de la dirección
        </h2>
        <p className="text-sm text-muted-foreground">
          Envía información GPS con datos longitudinales.
        </p>
      </header>

      <div className="rounded-lg bg-surface-subtle-light p-3 text-sm dark:bg-surface-subtle-dark dark:text-slate-400">
        <p>
          Esta información se puede enviar seleccionando la ubicación en el
          mapa, enviando su ubicación o pegando las coordenadas GPS.
        </p>
      </div>

      <div className="flex items-center justify-around gap-10">
        <p className="text-sm">
          Latitud:{" "}
          <span className="text-blue-500 font-mono">{latitude ?? "—"}</span>
        </p>
        <p className="text-sm">
          Longitud:{" "}
          <span className="text-blue-500 font-mono">{longitude ?? "—"}</span>
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <MapboxMap
        value={
          latitude != null && longitude != null ? { latitude, longitude } : null
        }
        onChange={(coords) => {
          setValue("latitude", coords.latitude);
          setValue("longitude", coords.longitude);
        }}
      />

      <div className="mx-auto flex flex-wrap justify-center gap-2 pt-2">
        <Button
          type="button"
          onClick={handleGetUserLocation}
          disabled={isFetchingGps}
          aria-busy={isFetchingGps}
        >
          <Pin aria-hidden="true" />
          {isFetchingGps ? "Obteniendo ubicación…" : "Mi ubicación"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handlePaste}
          disabled={isFetchingGps}
        >
          <Paperclip aria-hidden="true" />
          Pegar coordenadas
        </Button>

        <Button
          type="button"
          variant="destructive"
          onClick={handleClear}
          disabled={isFetchingGps}
        >
          <BrushCleaning aria-hidden="true" />
          Limpiar
        </Button>
      </div>
    </section>
  );
}
