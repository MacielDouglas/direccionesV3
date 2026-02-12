"use client";

import mapboxgl from "mapbox-gl";
import { createContext, useContext, useEffect, useRef, useState } from "react";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

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

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-34.8714515, -8.0630082],
      zoom: 15,
    });

    mapRef.current = map;

    map.on("load", () => {
      setState({
        map,
        isLoaded: true,
      });
    });

    return () => map.remove();
  }, []);

  return (
    <MapContext.Provider value={state}>
      <div ref={containerRef} className="w-full h-full" />
      {state.isLoaded && children}
    </MapContext.Provider>
  );
}
