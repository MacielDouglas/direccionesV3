export default function GestaoLoading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6" aria-busy="true">
      {/* Abas */}
      <div className="flex w-full gap-1 rounded-full border border-border bg-card p-1">
        <div className="h-11 flex-1 animate-pulse rounded-full bg-muted" />
        <div className="h-11 flex-1 animate-pulse rounded-full bg-muted" />
      </div>
      {/* Linhas */}
      <div className="flex flex-col gap-3">
        <div className="h-28 w-full animate-pulse rounded-2xl bg-muted" />
        <div className="h-28 w-full animate-pulse rounded-2xl bg-muted" />
        <div className="h-28 w-full animate-pulse rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
