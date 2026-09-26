import { getServerDictionary } from "@/lib/i18n/server";

export default async function DemoLoading() {
  const t = await getServerDictionary();

  return (
    <div
      className="mx-auto flex min-h-svh w-full max-w-md flex-col"
      aria-busy="true"
      aria-label={t.common.loadingLabels.demo}
    >
      {/* Cabeçalho */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
      </div>
      {/* Conteúdo */}
      <div className="flex flex-1 flex-col gap-4 px-4 pt-5">
        <div className="h-7 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-muted" />
        <div className="h-11 w-full animate-pulse rounded-full bg-muted" />
      </div>
      {/* Tabbar */}
      <div className="flex border-t border-border">
        <div className="h-14 flex-1 animate-pulse bg-muted/50" />
        <div className="h-14 flex-1 animate-pulse bg-muted/50" />
        <div className="h-14 flex-1 animate-pulse bg-muted/50" />
      </div>
    </div>
  );
}
