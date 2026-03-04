import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página no encontrada",
};

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 py-16">
      <section
        className="mx-auto w-full max-w-xl space-y-8 text-center"
        aria-labelledby="not-found-title"
      >
        <p className="text-sm font-medium tracking-widest uppercase text-brand">
          Error 404
        </p>

        <h1
          id="not-found-title"
          className="text-3xl font-light text-foreground sm:text-4xl md:text-5xl"
        >
          Esta página no existe
        </h1>

        <p className="mx-auto max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
          Puede que el enlace esté roto o que la página haya sido movida. No te
          preocupes, puedes volver al inicio y continuar navegando.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-brand px-6 py-3 font-medium text-white shadow-md shadow-brand/20 transition-colors hover:bg-brand/90 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Volver al inicio
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 font-medium text-foreground transition-colors hover:bg-foreground/5 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Ir al menú principal
          </Link>
        </div>

        <p className="pt-6 text-sm text-muted-foreground">
          Si crees que esto es un error, intenta actualizar la página.
        </p>
      </section>
    </main>
  );
}
