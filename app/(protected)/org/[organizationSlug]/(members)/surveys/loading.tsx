import { getServerDictionary } from "@/lib/i18n/server";

export default async function SurveysLoading() {
  const t = await getServerDictionary();
  return (
    <main
      aria-label={t.common.loadingLabels.surveyMap}
      aria-busy="true"
      className="relative h-svh w-full overflow-hidden"
    >
      <div className="absolute inset-0 animate-pulse bg-muted" />
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
        <div className="h-11 w-44 animate-pulse rounded-xl bg-muted" />
        <div className="h-11 w-11 animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="mx-auto flex h-12 w-48 animate-pulse items-center justify-center gap-2 rounded-full bg-muted" />
      </div>
    </main>
  );
}
