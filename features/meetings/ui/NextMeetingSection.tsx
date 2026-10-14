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
  isCountedPart,
  meetingSectionMetaOf,
  numberProgramParts,
  splitMeetingBlocks,
} from "@/features/meetings/domain/meeting-section";
import type { MeetingDetail, MeetingDuty } from "@/features/meetings/domain/meeting.schema";
import {
  MEETING_SHEET_CLASSES,
  ProgramFramingRow,
  ProgramPartRow,
  ProgramPresidentRow,
  ProgramSectionHeader,
} from "@/features/meetings/ui/program-parts";
import { sectionIconOf } from "@/features/meetings/ui/section-icons";
import {
  firstStartTime,
  formatLongDate,
  formatWeekRange,
  isReaderPart,
  isSeamosSection,
  shortWeekday,
  timeProgramParts,
} from "@/features/meetings/utils/meeting-format";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { CalendarDays, ChevronRight, Clock, UserRoundGroup, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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

/**
 * Seção Reuniões da home: card claro com acento azul (#1c69d4) da próxima
 * reunião + bottom-sheet com o programa (seções coloridas, partes numeradas
 * e presidente), no estilo do programa do Meeting.
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
  const countedParts = defaultMeeting.assignments.filter(isCountedPart).length;
  const partsLabel =
    countedParts === 1
      ? t.home.nextMeeting.partsCountSingular
      : t.home.nextMeeting.partsCount.replace("{count}", String(countedParts));

  const kindDuties = duties.filter((duty) => duty.meetingKind === kind);
  const presidentDuties = kindDuties.filter((duty) => /president/i.test(duty.postLabel));

  const timedBlocks = meeting
    ? timeProgramParts(meeting, numberProgramParts(splitMeetingBlocks(meeting.assignments)))
    : [];

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
          <DialogContent showCloseButton={false} className={MEETING_SHEET_CLASSES}>
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

                <ProgramPresidentRow duties={presidentDuties} time={firstStartTime(meeting)} />

                {meeting.assignments.length === 0 ? (
                  <p className="px-4 py-4 text-sm text-muted-foreground">
                    {t.meetings.noAssignments}
                  </p>
                ) : null}

                {timedBlocks.map((block, blockIndex) => {
                  const meta = meetingSectionMetaOf(block.section, locale);
                  return (
                    <section
                      key={`${block.section}-${blockIndex}`}
                      className="flex min-w-0 flex-col px-4 pt-2"
                    >
                      {block.hasCounted ? (
                        <ProgramSectionHeader
                          label={meta.label}
                          color={meta.color}
                          icon={sectionIconOf(block.section)}
                        />
                      ) : null}
                      <ul
                        className={
                          block.placement === "opening" ? undefined : "divide-y divide-border"
                        }
                      >
                        {block.parts.map(({ part, number, startTime }) =>
                          number === null ? (
                            <ProgramFramingRow
                              key={part.partKey}
                              part={part}
                              startTime={startTime}
                              songLabel={t.meetings.song}
                            />
                          ) : (
                            <ProgramPartRow
                              key={part.partKey}
                              part={part}
                              number={number}
                              startTime={startTime}
                              songLabel={t.meetings.song}
                              helperLabel={
                                isReaderPart(part) ? t.meetings.readerLabel : t.meetings.helperLabel
                              }
                              multilineSubtitle={isSeamosSection(block.section)}
                              mutedHelper={isSeamosSection(block.section) || isReaderPart(part)}
                            />
                          ),
                        )}
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
