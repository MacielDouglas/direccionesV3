"use client";

import { useEffect } from "react";

export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const id = window.setTimeout(() => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW é progressivo — falha silenciosa fora de HTTPS/localhost
      });
    }, 1500);
    return () => window.clearTimeout(id);
  }, []);

  return null;
}
