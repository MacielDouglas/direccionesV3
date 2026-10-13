"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  type MeetingAssignment,
  type MeetingLocale,
  meetingSectionMetaOf,
  splitMeetingBlocks,
} from "@/features/meetings/domain/meeting-section";
import type { MeetingDetail, MeetingDuty } from "@/features/meetings/domain/meeting.schema";
import { SECTION_ICONS } from "@/features/meetings/ui/section-icons";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { CalendarDays, ChevronRight, Clock, Crown, UserRoundGroup, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FaBookOpen } from "react-icons/fa";

type MeetingKind = "midweek" | "weekend";

interface NextMeetingSectionProps {
  weekStart: string;
  weekEnd: string;
  midweek: MeetingDetail | null;
  weekend: MeetingDetail | null;
  duties: MeetingDuty[];
  defaultKind: MeetingKind;
  organizationSlug: string;
}

/** Bottom-sheet mobile (mesmo padrão do AddressDetailModal). */
const SHEET_CLASSES = cn(
  "fixed z-50 gap-0",
  "max-h-[92dvh] w-full max-w-full overflow-x-hidden overflow-y-auto p-0",
  "left-0! right-0! bottom-0! top-auto! rounded-t-3xl! border-0!",
  "translate-x-0! translate-y-0!",
  "sm:left-1/2! sm:right-auto! sm:top-1/2! sm:bottom-auto! sm:-translate-x-1/2! sm:-translate-y-1/2!",
  "sm:max-w-lg! sm:rounded-3xl! sm:border! sm:max-h-[90dvh]",
);

function parseDay(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

function formatLongDate(iso: string, locale: MeetingLocale): string {
  const text = new Intl.DateTimeFormat(locale === "es" ? "es" : "pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(parseDay(iso));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Faixa da semana no topo do modal (ex.: "5 – 11 de outubro"). */
function formatWeekRange(startIso: string, endIso: string, locale: MeetingLocale): string {
  const start = parseDay(startIso);
  const end = parseDay(endIso);
  const tag = locale === "es" ? "es" : "pt-BR";
  if (start.getMonth() === end.getMonth()) {
    const month = new Intl.DateTimeFormat(tag, { month: "long" }).format(end);
    return `${start.getDate()} – ${end.getDate()} de ${month}`;
  }
  const short = (date: Date) =>
    new Intl.DateTimeFormat(tag, { month: "short" }).format(date).replace(/\./g, "");
  return `${start.getDate()} ${short(start)} – ${end.getDate()} ${short(end)}`;
}

function shortWeekday(iso: string, locale: MeetingLocale): string {
  return new Intl.DateTimeFormat(locale === "es" ? "es" : "pt-BR", { weekday: "short" })
    .format(parseDay(iso))
    .replace(/\./g, "");
}

function firstStartTime(meeting: MeetingDetail): string | null {
  return meeting.assignments.find((a) => a.startTime.trim() !== "")?.startTime ?? null;
}

/** Estudo bíblico da congregação: o segundo designado é o leitor, não o ajudante. */
function isCongregationBibleStudy(section: string): boolean {
  const normalized = section
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase();
  return normalized.includes("BIBLICO") && normalized.includes("CONGREGACION");
}

function PartRow({
  part,
  number,
  color,
  songLabel,
  helperLabel,
}: {
  part: MeetingAssignment;
  number: number;
  color: string;
  songLabel: string;
  helperLabel: string;
}) {
  const names = [
    part.personName,
    part.helperPersonName ? `${helperLabel}: ${part.helperPersonName}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const title = part.songNumber ? `${songLabel} ${part.songNumber}` : part.title;
  const subtitle = [
    part.subtitle,
    part.songTheme,
    part.speakerCongregation ? `(${part.speakerCongregation})` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <li className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 w-5 shrink-0 text-sm font-bold tabular-nums" style={{ color }}>
        {number}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-baseline justify-between gap-2">
          <span className="min-w-0 truncate text-sm font-semibold text-foreground">{title}</span>
          {part.durationMinutes ? (
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {part.durationMinutes} min
            </span>
          ) : null}
        </span>
        {subtitle ? (
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">{subtitle}</span>
        ) : null}
        {names ? (
          <span className="mt-0.5 block truncate text-sm font-medium text-foreground">{names}</span>
        ) : null}
      </span>
    </li>
  );
}

/**
 * Seção Reuniões da home: card claro com acento azul (#1c69d4) da próxima
 * reunião + bottom-sheet com o programa (seções coloridas, partes numeradas,
 * presidente e apoio), no estilo do programa do Meeting.
 */
export function NextMeetingSection({
  weekStart,
  weekEnd,
  midweek,
  weekend,
  duties,
  defaultKind,
  organizationSlug,
}: NextMeetingSectionProps) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<MeetingKind>(defaultKind);

  const defaultMeeting = defaultKind === "midweek" ? midweek : weekend;
  if (!defaultMeeting) return null;
  const meeting = kind === "midweek" ? midweek : weekend;
  const hasBoth = midweek !== null && weekend !== null;

  const kindTitle = kind === "midweek" ? t.meetings.midweekTitle : t.meetings.weekendTitle;
  const partsLabel =
    defaultMeeting.assignments.length === 1
      ? t.home.nextMeeting.partsCountSingular
      : t.home.nextMeeting.partsCount.replace("{count}", String(defaultMeeting.assignments.length));

  const kindDuties = duties.filter((duty) => duty.meetingKind === kind);
  const presidentDuties = kindDuties.filter((duty) => /president/i.test(duty.postLabel));

  const blocks = splitMeetingBlocks(meeting?.assignments ?? []);
  let partNumber = 0;
  const blocksWithNumbers = blocks.map((block) => ({
    ...block,
    parts: block.parts.map((part) => {
      partNumber += 1;
      return { part, number: partNumber };
    }),
  }));

  return (
    <section aria-labelledby="home-reunioes">
      <h2
        id="home-reunioes"
        className="flex items-center gap-2 text-base font-semibold text-foreground"
      >
        <UserRoundGroup className="size-4 text-meeting" aria-hidden="true" />
        {t.meetings.title}
      </h2>

      <div className="mt-3 rounded-xl border border-meeting/25 bg-meeting/10 p-4">
        <p className="text-sm font-semibold text-meeting-text">
          {defaultKind === "midweek" ? t.meetings.midweekTitle : t.meetings.weekendTitle}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="size-3.5 shrink-0 text-meeting" aria-hidden="true" />
          {formatLongDate(defaultMeeting.date, locale)}
        </p>
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
          <Clock className="size-3.5 text-meeting" aria-hidden="true" />
          {firstStartTime(defaultMeeting) ?? t.home.nextMeeting.timeToBeDefined}
          <span className="text-muted-foreground">· {partsLabel}</span>
        </p>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full bg-meeting px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-meeting/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meeting"
            >
              {t.home.nextMeeting.viewProgram}
            </button>
          </DialogTrigger>
          <DialogContent showCloseButton={false} className={SHEET_CLASSES}>
            <DialogHeader className="sr-only">
              <DialogTitle>{kindTitle}</DialogTitle>
              <DialogDescription>
                {formatLongDate((meeting ?? defaultMeeting).date, locale)}
              </DialogDescription>
            </DialogHeader>

            <div className="sticky top-0 z-10 flex min-w-0 flex-col bg-meeting px-4 pb-3 pt-5 text-white">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.common.close}
                className="absolute top-3 right-3 grid size-9 place-items-center rounded-full text-white/90 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
              <p className="pr-8 text-center text-base font-semibold tracking-tight">
                {formatWeekRange(weekStart, weekEnd, locale)}
              </p>
              {hasBoth && meeting ? (
                <fieldset className="mt-3 flex min-w-0 rounded-xl bg-white/15 p-1">
                  <legend className="sr-only">{t.meetings.title}</legend>
                  {(["midweek", "weekend"] as const).map((option) => {
                    const active = kind === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setKind(option)}
                        className={cn(
                          "h-11 min-w-0 flex-1 rounded-lg text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                          active
                            ? "bg-white font-semibold text-meeting shadow-sm"
                            : "font-medium text-white hover:bg-white/10",
                        )}
                      >
                        {option === "midweek" ? t.meetings.midweekShort : t.meetings.weekendShort}
                      </button>
                    );
                  })}
                </fieldset>
              ) : null}
            </div>

            {meeting ? (
              <div className="flex min-w-0 flex-col">
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <span className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-meeting/10 py-1.5 text-meeting-text">
                    <span className="text-xs font-semibold uppercase leading-none tracking-wide">
                      {shortWeekday(meeting.date, locale)}
                    </span>
                    <span className="mt-1 text-base font-bold leading-none tabular-nums">
                      {firstStartTime(meeting) ?? "--:--"}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {kindTitle}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {formatLongDate(meeting.date, locale)}
                    </span>
                  </span>
                </div>

                {presidentDuties.length > 0 ? (
                  <ul className="px-4">
                    {presidentDuties.map((duty, dutyIndex) => (
                      <li
                        key={`${duty.date}-${duty.dutyKey}-${dutyIndex}`}
                        className="flex items-center gap-3 border-b border-border py-2.5"
                      >
                        <span
                          aria-hidden
                          className="grid size-9 shrink-0 place-items-center rounded-xl bg-meeting/10 text-meeting-text"
                        >
                          <Crown className="size-4.5" />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                          {duty.postLabel}
                        </span>
                        <span className="min-w-0 max-w-[45%] flex-none truncate text-right text-sm font-medium text-meeting-text">
                          {duty.personName}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {meeting.assignments.length === 0 ? (
                  <p className="px-4 py-4 text-sm text-muted-foreground">
                    {t.meetings.noAssignments}
                  </p>
                ) : null}

                {blocksWithNumbers.map((block, blockIndex) => {
                  const meta = meetingSectionMetaOf(block.section, locale);
                  const SectionIcon = SECTION_ICONS[block.section] ?? FaBookOpen;
                  // Sem livro aberto no modal: seções sem ícone próprio (ex.: estudo
                  // bíblico da congregação) ou mapeadas para o livro mostram só o título.
                  const showSectionIcon = SectionIcon !== FaBookOpen;
                  return (
                    <section
                      key={`${block.section}-${blockIndex}`}
                      className="flex min-w-0 flex-col px-4 pt-2"
                    >
                      <div className="flex items-center gap-3 py-2">
                        {showSectionIcon ? (
                          <span
                            aria-hidden
                            className="grid size-10 shrink-0 place-items-center rounded-xl text-white"
                            style={{ backgroundColor: meta.color }}
                          >
                            <SectionIcon size={20} />
                          </span>
                        ) : null}
                        <h3
                          className="min-w-0 flex-1 break-words text-xl font-bold uppercase leading-tight tracking-tight"
                          style={{ color: meta.color }}
                        >
                          {meta.label}
                        </h3>
                      </div>
                      <ul className="divide-y divide-border">
                        {block.parts.map(({ part, number }) => (
                          <PartRow
                            key={part.partKey}
                            part={part}
                            number={number}
                            color={meta.color}
                            songLabel={t.meetings.song}
                            helperLabel={
                              isCongregationBibleStudy(block.section)
                                ? t.meetings.readerLabel
                                : t.meetings.helperLabel
                            }
                          />
                        ))}
                      </ul>
                    </section>
                  );
                })}

                <div className="mt-2 border-t border-border px-4 py-4">
                  <Link
                    href={`/org/${organizationSlug}/reunioes`}
                    onClick={() => setOpen(false)}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full bg-meeting px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-meeting/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meeting"
                  >
                    {t.home.nextMeeting.viewDetails}
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
