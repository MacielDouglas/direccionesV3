import Link from "next/link";

export default function NotFound() {
  return (
    <main
      role="main"
      className="
        min-h-screen
        flex items-center justify-center
        px-6 py-16
        bg-slate-50
        dark:bg-[#0c232a]
      "
    >
      <section
        className="
          mx-auto w-full max-w-xl
          text-center space-y-8
        "
        aria-labelledby="not-found-title"
      >
        {/* Código do erro */}
        <p className="text-orange-500 text-sm font-medium tracking-widest uppercase">
          Error 404
        </p>

        {/* Título principal */}
        <h1
          id="not-found-title"
          className="
            text-3xl sm:text-4xl md:text-5xl
            font-light
            text-slate-900
            dark:text-slate-100
          "
        >
          Esta página no existe
        </h1>

        {/* Descrição */}
        <p
          className="
            mx-auto max-w-md
            text-base sm:text-lg
            text-slate-600
            dark:text-slate-300
            leading-relaxed
          "
        >
          Puede que el enlace esté roto o que la página haya sido movida. No te
          preocupes, puedes volver al inicio y continuar navegando.
        </p>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/"
            className="
              inline-flex items-center justify-center
              rounded-xl
              bg-orange-500
              px-6 py-3
              text-white
              font-medium
              shadow-md shadow-orange-500/20
              transition
              hover:bg-orange-600
              active:scale-95
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-orange-500
              focus-visible:ring-offset-2
              dark:focus-visible:ring-offset-[#0c232a]
            "
          >
            Volver al inicio
          </Link>

          <Link
            href="/"
            className="
              inline-flex items-center justify-center
              rounded-xl
              px-6 py-3
              font-medium
              text-slate-700
              dark:text-slate-200
              hover:bg-black/5
              dark:hover:bg-white/5
              active:scale-95
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-orange-500
            "
          >
            Ir al menú principal
          </Link>
        </div>

        {/* Texto auxiliar */}
        <p className="pt-6 text-sm text-slate-500 dark:text-slate-400">
          Si crees que esto es un error, intenta actualizar la página.
        </p>
      </section>
    </main>
  );
}
