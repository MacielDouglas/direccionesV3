"use client";

import { LanguageSelector } from "@/components/LanguageSelector";
import { useI18n } from "@/lib/i18n/I18nProvider";
import Image from "next/image";
import { Suspense } from "react";
import LoginButton from "./LoginButton";

export function LoginCard() {
  const { t } = useI18n();

  return (
    <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8 rounded-xl  p-8  shadow-sm sm:p-9">
      <header className="flex flex-col items-center gap-5 text-center">
        <Image
          src="/Logo.svg"
          alt="Logotipo de Direcciones"
          width={96}
          height={96}
          unoptimized
          className="rounded-xl"
        />

        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-mauve-300">
            {t.login.title}
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t.login.welcome} <span className="font-bold text-brand">Direcciones</span>
          </h1>
          <p className="mt-2.5 text-sm leading-relaxed text-mauve-400">{t.login.withGoogle}</p>
        </div>
      </header>

      <div className="w-full">
        {/* ✅ Suspense necessário por causa do useSearchParams no LoginButton */}
        <Suspense fallback={<div className="h-11 w-full animate-pulse rounded-full bg-muted" />}>
          <LoginButton />
        </Suspense>
      </div>

      <div className="w-full border-t  border-mauve-600 pt-6 flex justify-center">
        <LanguageSelector />
      </div>
    </div>
  );
}
