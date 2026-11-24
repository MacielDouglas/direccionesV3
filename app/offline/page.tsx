import type { Metadata } from "next";
import { OfflineView } from "@/features/pwa/ui/OfflineView";
import { getServerDictionary } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  return { title: t.pwa.offlineTitle, description: t.pwa.offlineDescription };
}

export default function OfflinePage() {
  return <OfflineView />;
}
