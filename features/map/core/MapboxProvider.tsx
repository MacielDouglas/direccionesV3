"use client";

import mapboxgl from "mapbox-gl";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { mapPool } from "./mapPool";

type MapContextType = {
  map: mapboxgl.Map | null;
  isLoaded: boolean;
};

const MapContext = createContext<MapContextType>({
  map: null,
  isLoaded: false,
});

export function useMapInstance() {
  return useContext(MapContext);
}

export function MapboxProvider({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const [state, setState] = useState<MapContextType>({
    map: null,
    isLoaded: false,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    // ✅ Pega do pool em vez de criar novo
    const { map, isNew } = mapPool.acquire(containerRef.current);
    mapRef.current = map;

    if (!isNew && map.isStyleLoaded()) {
      // Instância reutilizada já está carregada
      setState({ map, isLoaded: true });
      requestAnimationFrame(() => map.resize());
    } else {
      // Nova instância — aguarda o evento "load"
      map.once("load", () => {
        setState({ map, isLoaded: true });
      });
    }

    return () => {
      // ✅ Devolve ao pool em vez de destruir
      mapPool.release(map);
      setState({ map: null, isLoaded: false });
      mapRef.current = null;
    };
  }, []);

  return (
    <MapContext.Provider value={state}>
      {/* container vazio — o pool injeta o div interno aqui */}
      <div ref={containerRef} className="h-full w-full" />
      {state.isLoaded && children}
    </MapContext.Provider>
  );
}
