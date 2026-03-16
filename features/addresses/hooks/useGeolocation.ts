"use client";

import { useEffect, useState } from "react";

type GeolocationState =
  | "idle"
  | "granted"
  | "denied"
  | "prompt"
  | "unsupported";

function getInitialState(): GeolocationState {
  if (typeof window === "undefined") return "idle";
  if (!navigator.geolocation) return "unsupported";
  return "idle";
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>(getInitialState);

  useEffect(() => {
    // Se já detectou unsupported no lazy init, não precisa fazer nada
    if (state === "unsupported") return;

    // Permissions API indisponível (raro em browsers modernos):
    // não chama setState no body — deixa em "idle" e depende do requestPermission
    if (!navigator.permissions) return;

    let permissionStatus: PermissionStatus | null = null;

    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        permissionStatus = result;

        // .then() é assíncrono — não é chamada síncrona no body do effect
        setState(result.state as GeolocationState);

        result.onchange = () => {
          setState(result.state as GeolocationState);
        };
      })
      .catch(() => {
        // silencia erro de query sem setState síncrono
      });

    return () => {
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestPermission = (
    onSuccess: (lat: number, lng: number) => void,
    onError: (msg: string) => void,
    onLoading: (v: boolean) => void,
  ) => {
    if (!navigator.geolocation) {
      onError("Geolocalización no soportada en este dispositivo.");
      return;
    }

    onLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState("granted");
        onSuccess(pos.coords.latitude, pos.coords.longitude);
        onLoading(false);
      },
      () => {
        setState("denied");
        onError("No fue posible obtener tu ubicación. Verifica los permisos.");
        onLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return { state, requestPermission };
}
