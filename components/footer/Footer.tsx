import type { Organization } from "better-auth/plugins";
import { Compass } from "lucide-react";
import Link from "next/link";
import BackToTopButton from "../ui/BackToTopButton";

interface FooterProps {
  organization: Organization | null;
}

const currentYear = new Date().getFullYear();

export default function Footer({ organization }: FooterProps) {
  return (
    <footer className="w-full border-t border-white/10 bg-[#0c232a] text-slate-100">
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Volver al inicio */}
        <BackToTopButton />

        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          {/* Brand */}
          <div className="text-center lg:text-left">
            <Link
              href="/"
              aria-label="Ir al inicio de Direcciones"
              className="inline-flex items-center gap-1 tracking-widest text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <span className="text-lg font-light uppercase md:text-xl">
                Direcci
              </span>
              <Compass className="size-5 text-brand" aria-hidden="true" />
              <span className="text-lg font-light uppercase md:text-xl">
                nes
              </span>
            </Link>

            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-gray-400 lg:mx-0">
              Un lugar para guardar, editar y almacenar direcciones favoritas
              para una fácil referencia.
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Navegación del pie de página">
            <ul className="flex flex-col items-center gap-4 text-sm sm:flex-row sm:gap-6 lg:justify-end">
              <li>
                <Link
                  href="/"
                  className="text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Direcciones
                </Link>
              </li>
              <li>
                <Link
                  href={`/org/${organization?.slug}/user`}
                  className="text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Perfil de usuario
                </Link>
              </li>
              <li>
                <Link
                  href="/condition"
                  className="text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Condiciones de uso
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="text-center text-xs text-gray-400 lg:text-right">
            © {currentYear} Direcciones. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
