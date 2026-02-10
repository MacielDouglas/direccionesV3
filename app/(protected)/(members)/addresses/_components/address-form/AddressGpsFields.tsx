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
  const { control, setValue } = useFormContext<AddressFormData>();

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
    "bg-muted/50 border-0 border-b-2 border-transparent rounded-none px-0 shadow-none focus-visible:ring-0 transition-colors border-b-muted focus:border-orange-500";

  return (
    <section className="space-y-4 border-b p-5">
      <header className="inline-flex gap-1 items-center">
        <SatelliteDish className="text-orange-500 w-8 h-8" />
        <h2 className="text-lg font-semibold">
          - Ubicación GPS de la dirección
        </h2>
      </header>

      <div className="flex items-center justify-between gap-10">
        <FormField
          control={control}
          name="latitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Latitude</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="-8.12345"
                  className={inputStyle}
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
              <FormLabel>Longitude</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="-34.92345"
                  className={inputStyle}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={handleGetUserLocation}
          disabled={isFetchingGps}
        >
          <Pin /> Mi ubicación
        </Button>

        <Button type="button" variant="outline" onClick={handlePaste}>
          <Paperclip /> Pegar coordenadas
        </Button>

        <Button type="button" variant="ghost" onClick={handleClear}>
          <BrushCleaning /> Limpiar
        </Button>
      </div>
    </section>
  );
}
