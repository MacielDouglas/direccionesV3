import { OfflineView } from "@/features/pwa/ui/OfflineView";
import { getServerDictionary } from "@/lib/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  return { title: t.pwa.offlineTitle, description: t.pwa.offlineDescription };
}

export default function OfflinePage() {
  return <OfflineView />;
}
