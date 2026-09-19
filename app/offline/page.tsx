import { OfflineView } from "@/features/pwa/ui/OfflineView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sin conexión",
  description: "Estás sin conexión. El contenido guardado sigue disponible.",
};

export default function OfflinePage() {
  return <OfflineView />;
}
