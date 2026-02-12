"use client";

import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import { AddressFormData } from "@/features/addresses/schemas/address.schema";

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

  // 📍 GPS do usuário
  const handleGetUserLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocalización no soportada.");
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

  // 📋 Colar coordenadas
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

  // ✕ Limpar
  const handleClear = () => {
    setValue("latitude", 0);
    setValue("longitude", 0);
    setError("");
  };

  const inputStyle =
    "bg-muted/50 border-0 border-b-2 border-transparent rounded-none px-0 shadow-none focus-visible:ring-0 transition-colors border-b-muted focus:border-orange-500 disabled:text-blue-500";

  return (
    <section className="space-y-4 border-b p-5 dark:bg-tertiary-drk">
      <header>
        <h2 className="text-xl font-semibold inline-flex gap-1 items-baseline">
          <SatelliteDish className="text-orange-500 w-7 h-7" /> Ubicación GPS de
          la dirección
        </h2>
        <p className="text-sm text-muted-foreground">
          Envía información GPS con datos longitudinales.
        </p>
      </header>

      <div className="bg-second-lgt dark:bg-second-drk p-3 text-sm dark:text-slate-400">
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
                Latitude:{" "}
                <span className="text-blue-500">{field.value ?? 0}</span>
              </FormLabel>
              <FormControl className="hidden">
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="-8.12345"
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
                Longitude:{" "}
                <span className="text-blue-500">{field.value ?? 0}</span>
              </FormLabel>
              <FormControl className="hidden">
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="-34.92345"
                  className={inputStyle}
                  disabled
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="space-y-4">
        <MapboxMap
          value={latitude && longitude ? { latitude, longitude } : null}
          onChange={(coords) => {
            setValue("latitude", coords.latitude);
            setValue("longitude", coords.longitude);
          }}
        />
      </div>

      <div className="flex flex-wrap gap-2 pt-2 mx-auto justify-center">
        <Button
          type="button"
          variant="default"
          onClick={handleGetUserLocation}
          disabled={isFetchingGps}
        >
          <Pin /> {isFetchingGps ? "Carregando..." : "Mi ubicación "}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handlePaste}
          disabled={isFetchingGps}
        >
          <Paperclip /> Pegar coordenadas
        </Button>

        <Button
          type="button"
          variant="destructive"
          onClick={handleClear}
          disabled={isFetchingGps}
        >
          <BrushCleaning /> Limpiar
        </Button>
      </div>
    </section>
  );
}
