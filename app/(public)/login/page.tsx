import { LoginCard } from "@/components/LoginCard";
import { getServerDictionary } from "@/lib/i18n/server";
import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  return { title: t.login.title };
}

export default async function LoginPage() {
  const t = await getServerDictionary();

  return (
    <div
      aria-label={t.login.title}
      className="relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden px-4"
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

      <div aria-hidden="true" className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-black/20 p-8 shadow-xl shadow-black/40 backdrop-blur-md sm:p-10">
        {/* <header className="flex flex-col items-center space-y-8">
          <h1 className="self-start text-4xl font-bold leading-snug text-white sm:text-3xl">
            Bienvenido a{" "}
            <span className="text-5xl font-bold tracking-wide text-brand">Direcciones</span>
          </h1>

          <Image
            src="/Logo.svg"
            alt="Logotipo de Direcciones"
            width={180}
            height={180}
            unoptimized
          />

          <p className="rounded-lg bg-black/40 px-3 py-2 text-center text-lg text-stone-200">
            Para comenzar, inicie sesión con su cuenta{" "}
            <span className="font-semibold text-red-400">Google</span>.
          </p>
        </header> */}

        <div className="mt-6">
          {/* ✅ Suspense necessário por causa do useSearchParams no LoginButton */}
          <Suspense fallback={<div className="h-10 w-full animate-pulse rounded-md bg-white/20" />}>
            <LoginCard />
            {/* <LoginButton /> */}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
