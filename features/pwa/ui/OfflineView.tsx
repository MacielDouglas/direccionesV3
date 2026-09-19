import Link from "next/link";

export function OfflineView() {
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-[70dvh] w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <div
        aria-hidden
        className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-2xl"
      >
        📡
      </div>
      <h1 className="text-xl font-semibold">Sin conexión</h1>
      <p className="text-sm text-muted-foreground">
        Estás offline. Las fotos, mapas y listas que ya abriste siguen disponibles. Las creaciones y
        ediciones necesitan internet.
      </p>
      <div className="flex w-full flex-col gap-2">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Intentar de nuevo
        </Link>
        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-md border px-4 text-sm font-medium"
        >
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
