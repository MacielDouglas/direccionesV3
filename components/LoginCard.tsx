"use client";

import { LanguageSelector } from "@/components/LanguageSelector";
import { useI18n } from "@/lib/i18n/I18nProvider";
import Image from "next/image";
import { Suspense } from "react";
import LoginButton from "./LoginButton";

export function LoginCard() {
  const { t } = useI18n();

  return (
    <div className="relative z-10 w-full max-w-sm rounded-3xl border border-white/10 bg-black/30 p-8 shadow-lg shadow-black/40 backdrop-blur-xl sm:p-10">
      <div className="flex flex-col items-center gap-8">
        <header className="flex flex-col items-center gap-5 text-center">
          <Image
            src="/Logo.svg"
            alt="Logotipo de Direcciones"
            width={96}
            height={96}
            unoptimized
            className="rounded-2xl ring-1 ring-white/10"
          />

          <div className="flex flex-col items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
              {t.login.welcome} <span className="font-bold text-brand">Direcciones</span>
            </h1>
            <p className="max-w-72 text-sm leading-relaxed text-white/75">{t.login.withGoogle}</p>
          </div>
        </header>

        <div className="w-full">
          {/* ✅ Suspense necessário por causa do useSearchParams no LoginButton */}
          <Suspense
            fallback={<div className="h-11 w-full animate-pulse rounded-full bg-white/15" />}
          >
            <LoginButton />
          </Suspense>
        </div>

        <LanguageSelector compact />
      </div>
    </div>
  );
}
