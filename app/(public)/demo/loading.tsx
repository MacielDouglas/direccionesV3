import { getServerDictionary } from "@/lib/i18n/server";
import { Loader2 } from "lucide-react";

export default async function DemoLoading() {
  const t = await getServerDictionary();

  return (
    <div
      className="flex min-h-svh items-center justify-center"
      aria-busy="true"
      aria-label={t.common.loadingLabels.demo}
    >
      <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
    </div>
  );
}
