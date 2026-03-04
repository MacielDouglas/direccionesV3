"use client";

import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BrushCleaning, Paperclip, Pin, SatelliteDish } from "lucide-react";
import { MapboxMap } from "@/features/map/components/MapboxMap";
import type { AddressFormData } from "../../domain/address.schema";

const extractCoords = (value: string) => {
  const cleaned = value.replace(/[()]/g, "").trim();
  const parts = cleaned.split(",").map((s) => s.trim());
  if (parts.length !== 2) return null;

  const lat = Number(parts[0]);
  const lng = Number(parts[1]);

  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
};

const inputStyle =
  "border-0 border-b-2 border-b-muted rounded-none px-0 shadow-none bg-transparent " +
  "focus-visible:ring-0 focus-visible:outline-none focus-visible:border-b-brand " +
  "transition-colors disabled:text-blue-500";

export default function AddressGpsFields() {
  const { control, setValue, watch } = useFormContext<AddressFormData>();
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
        <FormField
          control={control}
          name="latitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Latitud:{" "}
                <span className="text-blue-500">{field.value ?? "—"}</span>
              </FormLabel>
              <FormControl className="hidden">
                <Input
                  {...field}
                  value={field.value ?? ""}
                  className={inputStyle}
                  disabled
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="longitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Longitud:{" "}
                <span className="text-blue-500">{field.value ?? "—"}</span>
              </FormLabel>
              <FormControl className="hidden">
                <Input
                  {...field}
                  value={field.value ?? ""}
                  className={inputStyle}
                  disabled
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
