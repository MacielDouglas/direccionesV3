"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { ArrowLeft, CheckCircle2, Landmark, MapPin, UserRound } from "lucide-react";
import Image from "next/image";
import { SiGooglemaps, SiWaze } from "react-icons/si";
import type { DemoMuseum } from "../../domain/demo.data";
import { DemoBackToLogin } from "./DemoBackToLogin";
import { InfoNote } from "./InfoNote";

function MuseumFlag({ museum }: { museum: DemoMuseum }) {
  const { t } = useI18n();

  if (museum.flag === "personChanged") {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-[0.625rem] font-semibold uppercase tracking-widest text-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-300">
        <UserRound className="size-3.5" aria-hidden="true" />
        {t.demo.flags.personChanged}
      </span>
    );
  }

  if (museum.flag === "noVisits") {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-[0.625rem] font-semibold uppercase tracking-widest text-red-700 dark:bg-red-500/10 dark:text-red-300">
        <MapPin className="size-3.5" aria-hidden="true" />
        {t.demo.flags.noVisits}
      </span>
    );
  }

  if (museum.inviteDelivered) {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-[0.625rem] font-semibold uppercase tracking-widest text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
        <CheckCircle2 className="size-3.5" aria-hidden="true" />
        {t.demo.flags.inviteDeliveredOn} {museum.inviteYear}
      </span>
    );
  }

  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
      <MapPin className="size-3.5" aria-hidden="true" />
      {t.demo.addresses.situationTitle}
    </span>
  );
}

export function AddressDetailOverlay({
  museum,
  onBack,
}: {
  museum: DemoMuseum;
  onBack: () => void;
}) {
  const { t } = useI18n();
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${museum.lat},${museum.lng}`;
  const wazeUrl = `https://waze.com/ul?ll=${museum.lat},${museum.lng}&navigate=yes`;
  const description = t.demo.museums[museum.id as keyof typeof t.demo.museums];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          aria-label={t.demo.detail.back}
          className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <p className="truncate text-sm font-semibold text-foreground">{museum.name}</p>
      </header>

      <div className="mx-auto w-full max-w-md">
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={museum.photo}
            alt={museum.name}
            fill
            priority
            sizes="(max-width: 448px) 100vw, 448px"
            className="object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/50 to-transparent"
          />
        </div>

        <div className="flex flex-col gap-5 px-4 py-5">
          <div className="flex flex-col gap-2">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-widest text-brand">
              <Landmark className="size-3.5" aria-hidden="true" />
              {t.demo.museumChip}
            </span>
            <h1 className="text-2xl font-semibold tracking-tight">{museum.name}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4 shadow-xs">
            <p className="text-sm font-medium text-foreground">{museum.street}</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              {museum.neighborhood} · {museum.city}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold tracking-tight">
              {t.demo.addresses.situationTitle}
            </h2>
            <MuseumFlag museum={museum} />
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t.demo.addresses.situationNote}
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <SiGooglemaps className="size-4" aria-hidden="true" />
              {t.demo.addresses.openGoogleMaps}
            </a>
            <a
              href={wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <SiWaze className="size-4" aria-hidden="true" />
              {t.demo.addresses.openWaze}
            </a>
          </div>

          <InfoNote>{t.demo.detail.infoNote}</InfoNote>

          <DemoBackToLogin />

          <p className="text-center text-[0.625rem] text-muted-foreground/70">
            {t.demo.photoCredit}
          </p>
        </div>
      </div>
    </div>
  );
}
