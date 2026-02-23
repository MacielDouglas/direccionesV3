"use client";

import { Organization } from "better-auth/plugins";
import { ChevronUp, Compass } from "lucide-react";
import Link from "next/link";
import { useCallback } from "react";

interface FooterProps {
  organization: Organization | null;
}

export default function Footer({ organization }: FooterProps) {
  const currentYear = new Date().getFullYear();
  // const { organization } = useTenant();

  const handleBackToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <footer className="w-full bg-[#0c232a] border-t border-white/10 text-slate-100">
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Back to top */}
        <button
          onClick={handleBackToTop}
          aria-label="Voltar ao topo"
          className="
            absolute right-4 top-4
            rounded-full bg-teal-600 p-2
            text-white shadow-sm
            transition-all
            hover:bg-teal-500
            active:scale-95
            focus:outline-none focus:ring-2 focus:ring-teal-400
            sm:right-6 sm:top-6
            lg:right-8 lg:top-8
          "
        >
          <ChevronUp className="size-5" />
        </button>

        {/* Content */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          {/* Brand */}
          <div className="text-center lg:text-left">
            <Link
              href="/"
              className="inline-flex items-center gap-1 tracking-widest text-white"
            >
              <span className="text-lg md:text-xl font-light uppercase">
                Direcci
              </span>

              <Compass className="size-5 text-orange-500" />

              <span className="text-lg md:text-xl font-light uppercase">
                nes
              </span>
            </Link>

            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-gray-400 lg:mx-0">
              Un lugar para guardar, editar y almacenar direcciones favoritas
              para una fácil referencia.
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-col items-center gap-4 text-sm sm:flex-row sm:gap-6 lg:justify-end">
              <li>
                <Link
                  href="/"
                  className="text-white/80 transition hover:text-white"
                >
                  Direcciones
                </Link>
              </li>

              <li>
                <Link
                  href={`/org/${organization?.slug}/user`}
                  className="text-white/80 transition hover:text-white"
                >
                  Perfil usuário
                </Link>
              </li>

              <li>
                <Link
                  href="/condition"
                  className="text-white/80 transition hover:text-white"
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
            © {currentYear} Direcciones. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
