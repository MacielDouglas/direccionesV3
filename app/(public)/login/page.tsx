import { LoginCard } from "@/components/LoginCard";
import { getServerDictionary } from "@/lib/i18n/server";
import type { Metadata } from "next";
import Image from "next/image";

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

      <div aria-hidden="true" className="absolute inset-0 bg-black/40" />

      <LoginCard />
    </div>
  );
}
