"use client";

import { useHaptic } from "@/app/hooks/useHaptic";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { CheckCircle2, MapPin, UserRound, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { DEMO_CARD, type DemoMuseumFlag, demoMuseumById } from "../../domain/demo.data";
import { InfoNote } from "./InfoNote";

type MuseumFlags = {
  personChanged: boolean;
  noVisits: boolean;
  invite: boolean;
};

const EMPTY_FLAGS: MuseumFlags = { personChanged: false, noVisits: false, invite: false };

function FlagChip({ flag }: { flag: DemoMuseumFlag }) {
  const { t } = useI18n();

  if (flag === "personChanged") {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-widest text-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-300">
        <UserRound className="size-3" aria-hidden="true" />
        {t.demo.flags.personChanged}
      </span>
    );
  }

  if (flag === "noVisits") {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-widest text-red-700 dark:bg-red-500/10 dark:text-red-300">
        <MapPin className="size-3" aria-hidden="true" />
        {t.demo.flags.noVisits}
      </span>
    );
  }

  return null;
}

function SituationButtons({
  flags,
  onToggle,
}: {
  flags: MuseumFlags;
  onToggle: (key: keyof MuseumFlags) => void;
}) {
  const { t } = useI18n();

  const base =
    "min-h-11 w-full rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

  return (
    <div className="space-y-2.5">
      <button
        type="button"
        aria-pressed={flags.personChanged}
        onClick={() => onToggle("personChanged")}
        className={cn(
          base,
          flags.personChanged
            ? "bg-rose-600 text-white shadow-sm"
            : "border border-rose-200 bg-transparent text-rose-700 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/10",
        )}
      >
        {t.demo.flags.personChanged}
      </button>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {t.demo.flags.personChangedNote}
      </p>

      <button
        type="button"
        aria-pressed={flags.noVisits}
        onClick={() => onToggle("noVisits")}
        className={cn(
          base,
          flags.noVisits
            ? "bg-violet-600 text-white shadow-sm"
            : "border border-violet-200 bg-transparent text-violet-700 hover:bg-violet-50 dark:border-violet-500/30 dark:text-violet-300 dark:hover:bg-violet-500/10",
        )}
      >
        {t.demo.flags.noVisits}
      </button>
      <p className="text-xs leading-relaxed text-muted-foreground">{t.demo.flags.noVisitsNote}</p>

      <button
        type="button"
        aria-pressed={flags.invite}
        onClick={() => onToggle("invite")}
        className={cn(
          base,
          flags.invite
            ? "bg-brand text-brand-foreground shadow-sm"
            : "border border-brand/40 bg-transparent text-brand hover:bg-brand/5 dark:text-brand",
        )}
      >
        {t.demo.flags.invite}
      </button>
      <p className="text-xs leading-relaxed text-muted-foreground">{t.demo.flags.inviteNote}</p>
    </div>
  );
}

export function CardAddressModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const { vibrate } = useHaptic();
  const [flags, setFlags] = useState<Record<string, MuseumFlags>>(() =>
    Object.fromEntries(DEMO_CARD.museumIds.map((id) => [id, { ...EMPTY_FLAGS }])),
  );

  const toggle = (id: string, key: keyof MuseumFlags) => {
    vibrate("light");
    setFlags((prev) => ({ ...prev, [id]: { ...prev[id], [key]: !prev[id][key] } }));
  };

  const museums = DEMO_CARD.museumIds.map(demoMuseumById).filter((m) => m !== undefined);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md rounded-2xl! border p-0 shadow-lg max-h-[85dvh] overflow-y-auto gap-0"
      >
        <DialogHeader className="flex flex-row items-start justify-between gap-3 px-5 pb-2 pt-5 text-left">
          <div>
            <DialogTitle className="text-lg">{t.demo.cards.modalTitle}</DialogTitle>
            <DialogDescription className="mt-1 text-xs">{t.demo.cards.modalHint}</DialogDescription>
          </div>
          <DialogClose asChild>
            <button
              type="button"
              aria-label={t.common.close}
              className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </DialogClose>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-5 pb-5 pt-2">
          {museums.map((museum) => {
            const museumFlags = flags[museum.id] ?? EMPTY_FLAGS;
            const toned = museumFlags.personChanged || museumFlags.noVisits;

            return (
              <section
                key={museum.id}
                className={cn(
                  "flex flex-col gap-3 rounded-2xl border p-4",
                  toned
                    ? "border-border/60 bg-rose-50 dark:bg-rose-950/20"
                    : "border-border bg-background",
                )}
              >
                {(museumFlags.personChanged || museumFlags.noVisits) && (
                  <FlagChip flag={museumFlags.personChanged ? "personChanged" : "noVisits"} />
                )}

                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-foreground">
                      {museum.name}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <MapPin className="size-3 shrink-0" aria-hidden="true" />
                      {museum.street} · {museum.neighborhood}
                    </p>
                  </div>
                  <Image
                    src={museum.photo}
                    alt=""
                    width={80}
                    height={80}
                    className="size-20 shrink-0 rounded-xl object-cover"
                    aria-hidden="true"
                  />
                </div>

                <SituationButtons flags={museumFlags} onToggle={(key) => toggle(museum.id, key)} />

                {museumFlags.invite && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="size-3.5" aria-hidden="true" />
                    {t.demo.flags.inviteDeliveredOn} 2026
                  </p>
                )}
              </section>
            );
          })}

          <InfoNote>{t.demo.flags.toggleHint}</InfoNote>
        </div>
      </DialogContent>
    </Dialog>
  );
}
