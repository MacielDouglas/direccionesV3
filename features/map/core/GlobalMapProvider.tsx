"use client";

import { useEffect } from "react";
import { mapPool } from "./mapPool";

interface Props {
  children: React.ReactNode;
}

export function GlobalMapProvider({ children }: Props) {
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error(
        "[GlobalMapProvider] NEXT_PUBLIC_MAPBOX_TOKEN não definido.",
      );
      return;
    }

    mapPool.init(token);

    // Destrói instâncias ao fechar a aba/sessão
    const handleUnload = () => mapPool.destroy();
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  return <>{children}</>;
}
