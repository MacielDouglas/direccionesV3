import { LoginCard } from "@/components/LoginCard";
import { getServerDictionary } from "@/lib/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  return { title: t.login.title };
}

export default async function LoginPage() {
  const t = await getServerDictionary();

  return (
    <div
      aria-label={t.login.title}
      className="relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden px-4 py-12 bg-background"
    >
      <LoginCard />
    </div>
  );
}
