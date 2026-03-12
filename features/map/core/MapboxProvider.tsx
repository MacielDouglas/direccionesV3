"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { createContext, useContext, useEffect, useRef, useState } from "react";

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
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error("[MapboxProvider] NEXT_PUBLIC_MAPBOX_TOKEN no definido.");
      return;
    }

    if (!containerRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-34.8714515, -8.0630082],
      zoom: 15,
      pitchWithRotate: false, // desativa rotação 3D
      dragRotate: false, // desativa drag para rotacionar
      attributionControl: false, // remove controle de atribuição padrão (pesado)
      fadeDuration: 0, // tiles aparecem sem fade — mais rápido no mobile
    });

    mapRef.current = map;

    map.on("load", () => {
      mapRef.current = map;
      setState({ map, isLoaded: true });
    });

    return () => map.remove();
  }, []);

  return (
    <MapContext.Provider value={state}>
      <div ref={containerRef} className="h-full w-full" />
      {state.isLoaded && children}
    </MapContext.Provider>
  );
}
