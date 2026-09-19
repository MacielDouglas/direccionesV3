import { Skeleton } from "@/components/ui/skeleton";
import { getServerDictionary } from "@/lib/i18n/server";
import Image from "next/image";

export default async function LoginLoading() {
  const t = await getServerDictionary();
  return (
    <div
      aria-label={t.common.loadingLabels.login}
      aria-busy="true"
      className="relative flex min-h-dvh w-full flex-col items-center justify-center bg-stone-950 px-4 pt-[max(1.5rem,env(safe-area-inset-top,0px))] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]"
    >
      {/* Mesmo fundo da página para não piscar claro sob a status bar */}
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

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8 rounded-3xl border border-white/10 bg-black/30 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10">
        <header className="flex flex-col items-center gap-5 text-center">
          <Skeleton className="size-24 rounded-2xl bg-white/15" />
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-8 w-52 bg-white/15" />
            <Skeleton className="h-4 w-64 bg-white/15" />
          </div>
        </header>

        <Skeleton className="h-11 w-full rounded-full bg-white/15" />

        <Skeleton className="h-8 w-24 rounded-full bg-white/10" />
      </div>
    </div>
  );
}
