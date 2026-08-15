"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { CheckCircle2, ChevronRight, CreditCard, Handshake, MapPin, Sparkles } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { DEMO_CARD, DEMO_MUSEUMS, type DemoMuseum } from "../domain/demo.data";
import { AddressDetailOverlay } from "./components/AddressDetailOverlay";
import { CardAddressModal } from "./components/CardAddressModal";
import { DemoBackToLogin } from "./components/DemoBackToLogin";
import { type DemoTab, DemoTabBar } from "./components/DemoTabBar";
import { InfoNote } from "./components/InfoNote";

function DemoCardBanner() {
  const { t } = useI18n();

  return (
    <div
      className="relative overflow-hidden px-5 py-4 text-white"
      style={{
        // impeccable-disable-next-line design-system-color -- gradiente do cartão fake
        background: `linear-gradient(135deg, ${DEMO_CARD.color} 0%, color-mix(in srgb, ${DEMO_CARD.color} 55%, #000) 100%)`,
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-12 size-36 rounded-full bg-white/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-2 top-8 size-16 rounded-full bg-white/10"
      />

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/15 text-sm font-bold tabular-nums backdrop-blur-sm">
            {DEMO_CARD.number}
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
              {t.demo.cards.cardNumber}
            </p>
            <p className="text-2xl font-bold leading-none tabular-nums tracking-tight">
              #{DEMO_CARD.number}
            </p>
          </div>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
          <CheckCircle2 className="size-3.5" aria-hidden="true" />
          {t.demo.cards.holder}
        </span>
      </div>
    </div>
  );
}

function CardsTab({ onOpenCard }: { onOpenCard: () => void }) {
  const { t } = useI18n();
  const museums = DEMO_CARD.museumIds
    .map((id) => DEMO_MUSEUMS.find((m) => m.id === id))
    .filter((m): m is DemoMuseum => m !== undefined);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">{t.demo.cards.title}</h1>
        <p className="text-sm text-muted-foreground">{t.demo.cards.subtitle}</p>
      </div>

      <InfoNote>{t.demo.cards.infoNote}</InfoNote>

      <button
        type="button"
        onClick={onOpenCard}
        aria-haspopup="dialog"
        className="group w-full overflow-hidden rounded-2xl border border-border bg-card text-left shadow-xs transition-all duration-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <DemoCardBanner />
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-3">
            <span
              className="grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: DEMO_CARD.color }}
              aria-hidden="true"
            >
              A
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{DEMO_CARD.holder}</p>
              <p className="truncate text-xs text-muted-foreground">
                {t.demo.cards.sinceLabel} {t.demo.cards.sinceValue}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border pt-3">
            <p className="text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
              {t.demo.cards.neighborhoodsLabel}
            </p>
            <ul className="flex flex-col gap-2">
              {museums.map((museum) => (
                <li key={museum.id} className="flex items-center gap-2.5">
                  <Image
                    src={museum.photo}
                    alt=""
                    width={40}
                    height={40}
                    className="size-10 shrink-0 rounded-lg object-cover"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{museum.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {museum.street} · {museum.neighborhood}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <span className="flex items-center justify-between gap-2 rounded-full bg-muted px-4 py-2.5 text-xs font-medium text-muted-foreground">
            {t.demo.cards.addressesCount.replace("{count}", String(museums.length))}
            <span className="flex items-center gap-0.5 text-foreground transition-transform group-hover:translate-x-0.5">
              {t.demo.cards.tapHint}
              <ChevronRight className="size-4" aria-hidden="true" />
            </span>
          </span>
        </div>
      </button>

      <DemoBackToLogin />
    </div>
  );
}

function AddressesTab({ onSelect }: { onSelect: (id: string) => void }) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">{t.demo.addresses.title}</h1>
        <p className="text-sm text-muted-foreground">{t.demo.addresses.subtitle}</p>
      </div>

      <InfoNote>{t.demo.addresses.infoNote}</InfoNote>

      <ul className="flex flex-col gap-2.5">
        {DEMO_MUSEUMS.map((museum) => (
          <li key={museum.id}>
            <button
              type="button"
              onClick={() => onSelect(museum.id)}
              className="flex min-h-20 w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left shadow-xs transition-all duration-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <Image
                src={museum.photo}
                alt=""
                width={56}
                height={56}
                className="size-14 shrink-0 rounded-xl object-cover"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{museum.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {museum.street} · {museum.neighborhood}
                </p>
                <p className="truncate text-xs text-muted-foreground/70">{museum.city}</p>
              </div>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      <DemoBackToLogin />
    </div>
  );
}

function AboutTab({ onStart }: { onStart: () => void }) {
  const { t } = useI18n();

  const steps = [
    { Icon: MapPin, title: t.demo.intro.step1Title, text: t.demo.intro.step1Text },
    { Icon: CreditCard, title: t.demo.intro.step2Title, text: t.demo.intro.step2Text },
    { Icon: Handshake, title: t.demo.intro.step3Title, text: t.demo.intro.step3Text },
  ];

  const bullets = [t.demo.about.b1, t.demo.about.b2, t.demo.about.b3, t.demo.about.b4];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-widest text-brand">
          <Sparkles className="size-3.5" aria-hidden="true" />
          {t.demo.intro.eyebrow}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">{t.demo.intro.title}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">{t.demo.intro.subtitle}</p>
      </div>

      <p className="text-sm leading-relaxed text-foreground">{t.demo.about.p1}</p>
      <p className="text-sm leading-relaxed text-muted-foreground">{t.demo.about.p2}</p>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold tracking-tight">{t.demo.intro.stepsTitle}</h2>
        <ol className="flex flex-col gap-2.5">
          {steps.map(({ Icon, title, text }, index) => (
            <li
              key={title}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  <span className="mr-1 text-muted-foreground">{index + 1}.</span>
                  {title}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold tracking-tight">{t.demo.about.bulletsTitle}</h2>
        <ul className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 shadow-xs">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2 text-sm text-foreground">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col items-start gap-2 rounded-2xl border border-dashed border-border bg-card px-4 py-4">
        <p className="text-xs leading-relaxed text-muted-foreground">{t.demo.intro.disclaimer}</p>
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={onStart}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-brand px-4 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          {t.demo.intro.start}
        </button>
        <DemoBackToLogin />
      </div>
    </div>
  );
}

export function DemoApp() {
  const { t } = useI18n();
  const [tab, setTab] = useState<DemoTab>("cards");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cardOpen, setCardOpen] = useState(false);

  const selected = DEMO_MUSEUMS.find((museum) => museum.id === selectedId) ?? null;

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col">
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <Image
            src="/Logo.svg"
            alt=""
            width={28}
            height={28}
            unoptimized
            className="rounded-lg"
            aria-hidden="true"
          />
          <span className="text-sm font-semibold tracking-tight">{t.common.appName}</span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-widest text-brand">
          <Sparkles className="size-3" aria-hidden="true" />
          {t.demo.badge}
        </span>
      </header>

      <main className="flex-1 px-4 pb-32 pt-5">
        {tab === "cards" && <CardsTab onOpenCard={() => setCardOpen(true)} />}
        {tab === "addresses" && <AddressesTab onSelect={setSelectedId} />}
        {tab === "about" && <AboutTab onStart={() => setTab("cards")} />}
      </main>

      <DemoTabBar tab={tab} onChange={setTab} />

      {cardOpen && <CardAddressModal onClose={() => setCardOpen(false)} />}
      {selected && <AddressDetailOverlay museum={selected} onBack={() => setSelectedId(null)} />}
    </div>
  );
}
