export default function GestaoLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl animate-pulse px-4 py-6">
      <div className="h-10 w-full rounded-full bg-muted" />
      <div className="mt-6 space-y-3">
        <div className="h-20 w-full rounded-2xl bg-muted" />
        <div className="h-20 w-full rounded-2xl bg-muted" />
        <div className="h-20 w-full rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
