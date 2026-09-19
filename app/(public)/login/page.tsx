import { LoginCard } from "@/components/LoginCard";
import { getServerDictionary } from "@/lib/i18n/server";
import type { Metadata, Viewport } from "next";
import Image from "next/image";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  return {
    title: t.login.title,
    // Tela escura full-bleed: barra translúcida com texto claro no iOS.
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "Direcciones",
    },
  };
}

// Android: funde a status bar com a foto escura em vez do theme claro global.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0c0a09",
};

export default async function LoginPage() {
  const t = await getServerDictionary();

  return (
    <div
      aria-label={t.login.title}
      className="relative flex min-h-dvh w-full flex-col items-center justify-center bg-stone-950 px-4 pt-[max(1.5rem,env(safe-area-inset-top,0px))] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]"
    >
      {/* Fundo fixo no viewport: cobre a safe-area (notch/ilha dinâmica)
          sob a status bar translúcida — sem faixa clara no topo */}
      <div aria-hidden="true" className="fixed inset-0">
        <Image
          src="/street.webp"
          alt=""
          fill
          priority
          quality={80}
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <LoginCard />
    </div>
  );
}
