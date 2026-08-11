import { LanguageSelector } from "@/components/LanguageSelector";
import LoginButton from "@/components/LoginButton";
import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function LoginPage() {
  return (
    <div
      aria-label="Página de inicio de sesión"
      className="relative flex min-h-svh w-full flex-col items-center justify-center px-4 py-12"
    >
      <Image
        src="/street.webp"
        alt=""
        fill
        priority
        quality={80}
        className="object-cover object-center"
        aria-hidden="true"
      />

      <div aria-hidden="true" className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8 rounded-2xl bg-background p-8 shadow-xl shadow-black/20 sm:p-10">
        <header className="flex flex-col items-center gap-6 text-center">
          <Image
            src="/Logo.svg"
            alt="Logotipo de Direcciones"
            width={112}
            height={112}
            unoptimized
            className="rounded-2xl"
          />

          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Bienvenido a <span className="font-bold text-brand">Direcciones</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Para comenzar, inicie sesión con su cuenta{" "}
              <span className="font-semibold text-foreground">Google</span>.
            </p>
          </div>
        </header>

        <div className="w-full">
          {/* ✅ Suspense necessário por causa do useSearchParams no LoginButton */}
          <Suspense fallback={<div className="h-11 w-full animate-pulse rounded-full bg-muted" />}>
            <LoginButton />
          </Suspense>
        </div>

        <div className="w-full border-t border-border pt-6">
          <LanguageSelector className="items-center" />
        </div>
      </div>
    </div>
  );
}
