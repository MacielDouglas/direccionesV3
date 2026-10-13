"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { StoredWeekProgram } from "@/features/meetings/application/meeting.service";
import {
  type MeetingLocale,
  meetingSectionMetaOf,
  splitMeetingBlocks,
} from "@/features/meetings/domain/meeting-section";
import type { MeetingDetail, MeetingDuty } from "@/features/meetings/domain/meeting.schema";
import {
  MEETING_SHEET_DESIGNATIONS_CLASSES,
  MEETING_SHEET_NARROW_CLASSES,
  type ProgramIcon,
  ProgramPartRow,
  ProgramPresidentRow,
  ProgramSectionHeader,
  cleaningIconFor,
  dutyIconFor,
} from "@/features/meetings/ui/program-parts";
import { sectionIconOf } from "@/features/meetings/ui/section-icons";
import {
  firstStartTime,
  formatAttendantPost,
  formatLongDate,
  formatShortDay,
  formatWeekRange,
  isCongregationBibleStudy,
  shortWeekday,
} from "@/features/meetings/utils/meeting-format";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { I18nDictionary } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";
import { BrushCleaning, X } from "lucide-react";
import { type CSSProperties, useState } from "react";
import { FaHandsHelping } from "react-icons/fa";

type Texts = I18nDictionary["meetings"];
type MeetingKind = "midweek" | "weekend";

function TimeBadge({
  children,
  className = "",
  style,
}: {
  children: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`shrink-0 rounded-lg px-2 py-1 text-xs font-semibold tabular-nums ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}

function DutyRow({
  date,
  post,
  detail,
  person,
  locale,
  icon,
  badgeClassName = "bg-brand text-brand-foreground",
}: {
  date: string;
  post: string;
  detail?: string;
  person: string;
  locale: MeetingLocale;
  icon?: ProgramIcon | null;
  badgeClassName?: string;
}) {
  const Icon = icon;
  return (
    <article
      aria-label={person ? `${post} — ${person}` : post}
      className="flex w-full min-w-0 items-start gap-3 py-3"
    >
      <TimeBadge className={badgeClassName}>{formatShortDay(date, locale)}</TimeBadge>
      {Icon ? (
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center self-center rounded-xl bg-meeting/10 text-meeting-text"
        >
          <Icon size={18} />
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">{post}</span>
        {detail ? (
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">{detail}</span>
        ) : null}
        {person ? (
          <span className="mt-0.5 block text-right">
            <span className="block truncate text-sm font-semibold text-foreground">{person}</span>
          </span>
        ) : null}
      </span>
    </article>
  );
}

function MeetingPanel({
  meeting,
  title,
  presidentDuties,
  texts,
  locale,
}: {
  meeting: MeetingDetail;
  title: string;
  presidentDuties: MeetingDuty[];
  texts: Texts;
  locale: MeetingLocale;
}) {
  const blocks = splitMeetingBlocks(meeting.assignments);
  let partNumber = 0;
  const blocksWithNumbers = blocks.map((block) => ({
    ...block,
    parts: block.parts.map((part) => {
      partNumber += 1;
      return { part, number: partNumber };
    }),
  }));
  return (
    <section
      aria-label={title}
      className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card pb-3 shadow-xs"
    >
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
          <span className="block truncate text-sm font-semibold text-foreground">{title}</span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {formatLongDate(meeting.date, locale)}
          </span>
        </span>
      </div>

      <ProgramPresidentRow duties={presidentDuties} />

      {meeting.assignments.length === 0 ? (
        <p className="px-4 py-4 text-sm text-muted-foreground">{texts.noAssignments}</p>
      ) : null}

      {blocksWithNumbers.map((block, blockIndex) => {
        const meta = meetingSectionMetaOf(block.section, locale);
        return (
          <div key={`${block.section}-${blockIndex}`} className="flex min-w-0 flex-col px-4 pt-2">
            <ProgramSectionHeader
              label={meta.label}
              color={meta.color}
              icon={sectionIconOf(block.section)}
            />
            <ul className="divide-y divide-border">
              {block.parts.map(({ part, number }) => (
                <ProgramPartRow
                  key={part.partKey}
                  part={part}
                  number={number}
                  color={meta.color}
                  songLabel={texts.song}
                  helperLabel={
                    isCongregationBibleStudy(block.section) ? texts.readerLabel : texts.helperLabel
                  }
                />
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

export function MeetingWeekView({
  week,
  texts,
  locale,
}: {
  week: StoredWeekProgram;
  texts: Texts;
  locale: MeetingLocale;
}) {
  const { t } = useI18n();
  const kinds: MeetingKind[] = [
    ...(week.midweek ? (["midweek"] as const) : []),
    ...(week.weekend ? (["weekend"] as const) : []),
  ];
  const [kind, setKind] = useState<MeetingKind>(kinds[0] ?? "midweek");
  const [designationsOpen, setDesignationsOpen] = useState(false);
  const [cleaningOpen, setCleaningOpen] = useState(false);
  const meeting = kind === "midweek" ? week.midweek : week.weekend;
  const hasBoth = week.midweek !== null && week.weekend !== null;
  const title = kind === "midweek" ? texts.midweekTitle : texts.weekendTitle;
  const kindDuties = week.duties.filter((duty) => duty.meetingKind === kind);
  const presidentDuties = kindDuties.filter((duty) => /president/i.test(duty.postLabel));
  const otherDuties = kindDuties.filter((duty) => !/president/i.test(duty.postLabel));
  // Limpeza só da reunião selecionada (a semana pode ter dias das duas reuniões).
  const meetingCleaning = meeting ? week.cleaning.filter((item) => item.date === meeting.date) : [];
  const showActions = meeting !== null && (otherDuties.length > 0 || meetingCleaning.length > 0);

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {(week.midweek || week.weekend) && (
        <div className="flex min-w-0 flex-col rounded-2xl bg-meeting px-4 pb-3 pt-5 text-white shadow-xs">
          <p className="text-center text-base font-semibold tracking-tight">
            {formatWeekRange(week.weekStart, week.weekEnd, locale)}
          </p>
          {hasBoth ? (
            <fieldset className="mt-3 flex min-w-0 rounded-xl bg-white/15 p-1">
              <legend className="sr-only">{texts.title}</legend>
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
                    {option === "midweek" ? texts.midweekShort : texts.weekendShort}
                  </button>
                );
              })}
            </fieldset>
          ) : null}
        </div>
      )}

      {meeting && showActions ? (
        <div className="flex gap-2">
          {otherDuties.length > 0 ? (
            <Dialog open={designationsOpen} onOpenChange={setDesignationsOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-meeting px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-meeting/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meeting"
                >
                  <FaHandsHelping size={16} aria-hidden="true" />
                  {texts.designationsLabel}
                </button>
              </DialogTrigger>
              <DialogContent showCloseButton={false} className={MEETING_SHEET_DESIGNATIONS_CLASSES}>
                <DialogHeader className="sr-only">
                  <DialogTitle>{texts.designationsLabel}</DialogTitle>
                  <DialogDescription>
                    {title} · {formatLongDate(meeting.date, locale)}
                  </DialogDescription>
                </DialogHeader>
                <div className="sticky top-0 z-10 flex min-w-0 items-center justify-center bg-meeting px-12 py-4 text-white">
                  <p className="truncate text-center text-base font-semibold tracking-tight">
                    {texts.designationsLabel}
                  </p>
                  <button
                    type="button"
                    onClick={() => setDesignationsOpen(false)}
                    aria-label={t.common.close}
                    className="absolute top-1/2 right-3 grid size-9 -translate-y-1/2 place-items-center rounded-full text-white/90 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <X className="size-5" aria-hidden="true" />
                  </button>
                </div>
                <ul className="divide-y divide-border px-4 pb-4">
                  {otherDuties.map((duty, dutyIndex) => {
                    const DutyIcon = dutyIconFor(duty.postLabel);
                    return (
                      <li
                        key={`${duty.date}-${duty.dutyKey}-${dutyIndex}`}
                        className="flex items-center gap-3 py-2.5"
                      >
                        <span
                          aria-hidden
                          className="grid size-9 shrink-0 place-items-center rounded-xl bg-meeting/10 text-meeting-text"
                        >
                          <DutyIcon size={18} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {formatAttendantPost(duty.postLabel, texts.attendantLabel)}
                          </p>
                          <p className="mt-0.5 truncate text-right text-sm text-muted-foreground">
                            {duty.personName}
                          </p>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </DialogContent>
            </Dialog>
          ) : null}
          {meetingCleaning.length > 0 ? (
            <Dialog open={cleaningOpen} onOpenChange={setCleaningOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meeting"
                >
                  <BrushCleaning size={16} aria-hidden="true" className="text-meeting" />
                  {texts.cleaningTitle}
                </button>
              </DialogTrigger>
              <DialogContent showCloseButton={false} className={MEETING_SHEET_NARROW_CLASSES}>
                <DialogHeader className="sr-only">
                  <DialogTitle>{texts.cleaningTitle}</DialogTitle>
                  <DialogDescription>
                    {title} · {formatLongDate(meeting.date, locale)}
                  </DialogDescription>
                </DialogHeader>
                <div className="sticky top-0 z-10 flex min-w-0 items-center justify-center bg-meeting px-12 py-4 text-white">
                  <p className="truncate text-center text-base font-semibold tracking-tight">
                    {texts.cleaningTitle}
                  </p>
                  <button
                    type="button"
                    onClick={() => setCleaningOpen(false)}
                    aria-label={t.common.close}
                    className="absolute top-1/2 right-3 grid size-9 -translate-y-1/2 place-items-center rounded-full text-white/90 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <X className="size-5" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex min-w-0 flex-col divide-y divide-border px-4 pb-4">
                  {meetingCleaning.map((item, itemIndex) => {
                    // Espanhol quando cadastrado; senão cai no texto original.
                    const sectorLabel =
                      locale === "es" ? item.sectorNameEs || item.sectorName : item.sectorName;
                    const taskText = locale === "es" ? item.taskEs || item.task : item.task;
                    return (
                      <DutyRow
                        key={`${item.date}-${item.sectorName}-${itemIndex}`}
                        date={item.date}
                        post={sectorLabel}
                        detail={taskText}
                        person={item.personName}
                        locale={locale}
                        icon={cleaningIconFor(item.sectorName)}
                        badgeClassName="bg-muted text-foreground"
                      />
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>
          ) : null}
        </div>
      ) : null}

      {!week.midweek && !week.weekend ? (
        <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-xs">
          {texts.noProgram}
        </p>
      ) : null}

      {meeting ? (
        <MeetingPanel
          meeting={meeting}
          title={title}
          presidentDuties={presidentDuties}
          texts={texts}
          locale={locale}
        />
      ) : null}

      <p className="text-xs text-muted-foreground">
        {texts.fetchedAt}{" "}
        {new Date(week.fetchedAt).toLocaleString(locale === "es" ? "es" : "pt-BR")}
      </p>
    </div>
  );
}
