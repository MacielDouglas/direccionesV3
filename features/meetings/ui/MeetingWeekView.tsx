"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { getMeetingWeekAction } from "@/features/meetings/application/meeting.actions";
import type {
  StoredWeekProgram,
  StoredWeekSummary,
} from "@/features/meetings/application/meeting.service";
import {
  type MeetingLocale,
  meetingSectionMetaOf,
  numberProgramParts,
  splitMeetingBlocks,
} from "@/features/meetings/domain/meeting-section";
import type { MeetingDetail, MeetingDuty } from "@/features/meetings/domain/meeting.schema";
import {
  MEETING_SHEET_DESIGNATIONS_CLASSES,
  ProgramFramingRow,
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
  formatFullNumeric,
  formatLongDate,
  formatWeekRange,
  groupCleaningBySector,
  isReaderPart,
  isSeamosSection,
  shortWeekday,
  timeProgramParts,
} from "@/features/meetings/utils/meeting-format";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { I18nDictionary } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";
import { BrushCleaning, ChevronsUpDown, HandHelping, RefreshCw, Undo2, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Select as SelectPrimitive } from "radix-ui";
import { useMemo, useState } from "react";

type Texts = I18nDictionary["meetings"];
type MeetingKind = "midweek" | "weekend";

function DutyRow({
  post,
  detail,
  person,
  icon,
}: {
  post: string;
  detail?: string;
  person: string;
  icon?: ProgramIcon | null;
}) {
  const Icon = icon;
  return (
    <article
      aria-label={person ? `${post} — ${person}` : post}
      className="flex w-full min-w-0 items-start gap-3 py-3"
    >
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
          <span className="mt-0.5 block break-words text-xs text-muted-foreground">{detail}</span>
        ) : null}
        {person ? (
          <span className="mt-0.5 block text-right">
            <span className="block break-words text-sm font-semibold text-foreground">
              {person}
            </span>
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
  const timedBlocks = useMemo(
    () => timeProgramParts(meeting, numberProgramParts(splitMeetingBlocks(meeting.assignments))),
    [meeting],
  );
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

      <ProgramPresidentRow duties={presidentDuties} time={firstStartTime(meeting)} />

      {meeting.assignments.length === 0 ? (
        <p className="px-4 py-4 text-sm text-muted-foreground">{texts.noAssignments}</p>
      ) : null}

      {timedBlocks.map((block, blockIndex) => {
        const meta = meetingSectionMetaOf(block.section, locale);
        return (
          <div key={`${block.section}-${blockIndex}`} className="flex min-w-0 flex-col px-4 pt-2">
            {block.hasCounted ? (
              <ProgramSectionHeader
                label={meta.label}
                color={meta.color}
                icon={sectionIconOf(block.section)}
              />
            ) : null}
            <ul className={block.placement === "opening" ? undefined : "divide-y divide-border"}>
              {block.parts.map(({ part, number, startTime }) =>
                number === null ? (
                  <ProgramFramingRow
                    key={part.partKey}
                    part={part}
                    startTime={startTime}
                    songLabel={texts.song}
                  />
                ) : (
                  <ProgramPartRow
                    key={part.partKey}
                    part={part}
                    number={number}
                    startTime={startTime}
                    songLabel={texts.song}
                    helperLabel={isReaderPart(part) ? texts.readerLabel : texts.helperLabel}
                    multilineSubtitle={isSeamosSection(block.section)}
                    mutedHelper={isSeamosSection(block.section) || isReaderPart(part)}
                  />
                ),
              )}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

export function MeetingWeekView({
  week,
  weeks,
  initialWeek,
  organizationId,
  texts,
  locale,
}: {
  week: StoredWeekProgram;
  /** Semanas salvas (mais antiga → mais recente) para as setas < >. */
  weeks: StoredWeekSummary[];
  /** Semana do deep-link ?week= (já buscada no servidor; null = atual). */
  initialWeek: StoredWeekProgram | null;
  organizationId: string;
  texts: Texts;
  locale: MeetingLocale;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedStart, setSelectedStart] = useState(initialWeek?.weekStart ?? week.weekStart);
  const [loadedWeek, setLoadedWeek] = useState<StoredWeekProgram | null>(initialWeek);
  const [navigating, setNavigating] = useState(false);
  const [navError, setNavError] = useState(false);
  const [failedIndex, setFailedIndex] = useState<number | null>(null);
  // A semana exibida é a atual (prop) ou uma salva já buscada; se a busca
  // falhar, mantém a semana anterior em vez de tela vazia.
  const displayedWeek =
    selectedStart === week.weekStart || loadedWeek?.weekStart !== selectedStart ? week : loadedWeek;
  const currentIndex = weeks.findIndex((item) => item.weekStart === selectedStart);
  const isViewingOtherWeek = selectedStart !== week.weekStart;

  /** Espelha a semana na URL (deep-link compartilhável; replace sem poluir histórico). */
  function syncWeekParam(weekStart: string | null) {
    router.replace(weekStart ? `${pathname}?week=${weekStart}` : pathname, { scroll: false });
  }

  /** Volta à semana atual (já em mãos: sem busca). */
  function backToCurrentWeek() {
    if (navigating) return;
    setNavError(false);
    setFailedIndex(null);
    setLoadedWeek(null);
    setSelectedStart(week.weekStart);
    syncWeekParam(null);
  }

  async function goToWeek(index: number) {
    const target = weeks[index];
    if (!target || index === currentIndex || navigating) return;
    setNavError(false);
    setFailedIndex(null);
    syncWeekParam(target.weekStart === week.weekStart ? null : target.weekStart);
    if (target.weekStart === week.weekStart) {
      setLoadedWeek(null);
      setSelectedStart(target.weekStart);
      return;
    }
    setNavigating(true);
    const result = await getMeetingWeekAction({
      organizationId,
      weekStart: target.weekStart,
    });
    setNavigating(false);
    if (result.ok) {
      setLoadedWeek(result.week);
      setSelectedStart(target.weekStart);
    } else {
      setNavError(true);
      setFailedIndex(index);
    }
  }

  const kinds: MeetingKind[] = [
    ...(displayedWeek.midweek ? (["midweek"] as const) : []),
    ...(displayedWeek.weekend ? (["weekend"] as const) : []),
  ];
  const [kind, setKind] = useState<MeetingKind>(kinds[0] ?? "midweek");
  // A semana exibida pode não ter a aba ativa (ex.: só fim de semana).
  const effectiveKind = kinds.includes(kind) ? kind : (kinds[0] ?? "midweek");
  const [designationsOpen, setDesignationsOpen] = useState(false);
  const [cleaningOpen, setCleaningOpen] = useState(false);
  const meeting = effectiveKind === "midweek" ? displayedWeek.midweek : displayedWeek.weekend;
  const hasBoth = displayedWeek.midweek !== null && displayedWeek.weekend !== null;
  const title = effectiveKind === "midweek" ? texts.midweekTitle : texts.weekendTitle;
  const shortLabel = effectiveKind === "midweek" ? texts.midweekShort : texts.weekendShort;
  const kindDuties = useMemo(
    () => displayedWeek.duties.filter((duty) => duty.meetingKind === effectiveKind),
    [displayedWeek.duties, effectiveKind],
  );
  const presidentDuties = useMemo(
    () => kindDuties.filter((duty) => /president/i.test(duty.postLabel)),
    [kindDuties],
  );
  const otherDuties = useMemo(
    () => kindDuties.filter((duty) => !/president/i.test(duty.postLabel)),
    [kindDuties],
  );
  // Limpeza só da reunião selecionada (a semana pode ter dias das duas reuniões).
  const meetingCleaning = useMemo(
    () => (meeting ? displayedWeek.cleaning.filter((item) => item.date === meeting.date) : []),
    [displayedWeek.cleaning, meeting],
  );
  const cleaningGroups = useMemo(() => groupCleaningBySector(meetingCleaning), [meetingCleaning]);
  const showActions = meeting !== null && (otherDuties.length > 0 || meetingCleaning.length > 0);

  return (
    <div
      aria-busy={navigating}
      className={cn("flex min-w-0 flex-col gap-4 transition-opacity", navigating && "opacity-60")}
    >
      {(displayedWeek.midweek || displayedWeek.weekend) && (
        <div className="flex min-w-0 flex-col rounded-2xl bg-meeting px-4 pb-3 pt-5 text-white shadow-xs">
          {weeks.length > 1 ? (
            <SelectPrimitive.Root
              value={selectedStart}
              onValueChange={(value) => {
                const index = weeks.findIndex((item) => item.weekStart === value);
                if (index >= 0) goToWeek(index);
              }}
              disabled={navigating}
            >
              <SelectPrimitive.Trigger
                aria-label={texts.selectWeek}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white/15 px-4 text-base font-semibold tracking-tight text-white shadow-xs transition-colors outline-none hover:bg-white/25 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <SelectValue />
                <ChevronsUpDown className="size-5 shrink-0 text-white" aria-hidden="true" />
              </SelectPrimitive.Trigger>
              <SelectPrimitive.Portal>
                <SelectContent className="rounded-xl" position="popper">
                  {weeks.map((item) => {
                    const isCurrentWeek = item.weekStart === week.weekStart;
                    return (
                      <SelectItem
                        key={item.weekStart}
                        value={item.weekStart}
                        className={cn(
                          "min-h-11 rounded-lg",
                          isCurrentWeek &&
                            "bg-meeting/10 font-bold text-meeting-text shadow-xs focus:bg-meeting/20 focus:text-meeting-text",
                        )}
                      >
                        {formatWeekRange(item.weekStart, item.weekEnd, locale)}
                        {isCurrentWeek ? ` • ${texts.currentWeek}` : null}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </SelectPrimitive.Portal>
            </SelectPrimitive.Root>
          ) : (
            <p className="text-center text-base font-semibold tracking-tight">
              {formatWeekRange(displayedWeek.weekStart, displayedWeek.weekEnd, locale)}
            </p>
          )}
          {navError ? (
            <div role="alert" className="mt-2 flex items-center justify-center gap-2">
              <p className="min-w-0 flex-1 text-center text-xs font-medium text-white">
                {texts.loadErrorDescription}
              </p>
              <button
                type="button"
                onClick={() => goToWeek(failedIndex ?? currentIndex)}
                disabled={navigating || failedIndex === null}
                className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-4 text-xs font-semibold text-white transition-colors hover:bg-white/25 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <RefreshCw className="size-3.5" aria-hidden="true" />
                {t.errors.retry}
              </button>
            </div>
          ) : null}
          {isViewingOtherWeek ? (
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={backToCurrentWeek}
                disabled={navigating}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-white/15 px-5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-white/25 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Undo2 className="size-4" aria-hidden="true" />
                {texts.backToCurrentWeek}
              </button>
            </div>
          ) : null}
          {hasBoth ? (
            <fieldset className="mt-3 flex min-w-0 rounded-xl bg-white/15 p-1">
              <legend className="sr-only">
                {texts.midweekShort} / {texts.weekendShort}
              </legend>
              {(["midweek", "weekend"] as const).map((option) => {
                const active = effectiveKind === option;
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
                  <HandHelping size={16} aria-hidden="true" />
                  {texts.designationsLabel}
                </button>
              </DialogTrigger>
              <DialogContent showCloseButton={false} className={MEETING_SHEET_DESIGNATIONS_CLASSES}>
                <DialogHeader className="sr-only">
                  <DialogTitle>
                    {texts.designationsLabel} - {shortLabel} - {formatFullNumeric(meeting.date)}
                  </DialogTitle>
                  <DialogDescription>
                    {title} · {formatLongDate(meeting.date, locale)}
                  </DialogDescription>
                </DialogHeader>
                <div className="sticky top-0 z-10 flex min-w-0 items-center justify-center bg-meeting px-12 py-4 text-white">
                  <p className="break-words text-center text-base font-semibold tracking-tight">
                    {texts.designationsLabel} - {shortLabel} - {formatFullNumeric(meeting.date)}
                  </p>
                  <button
                    type="button"
                    onClick={() => setDesignationsOpen(false)}
                    aria-label={t.common.close}
                    className="absolute top-1/2 right-2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-white/90 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
                        <span
                          title={duty.postLabel}
                          className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground"
                        >
                          {formatAttendantPost(duty.postLabel, texts.attendantLabel)}
                        </span>
                        <span
                          title={duty.personName}
                          className="min-w-0 max-w-[45%] flex-none truncate text-right text-sm text-muted-foreground"
                        >
                          {duty.personName}
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
              <DialogContent showCloseButton={false} className={MEETING_SHEET_DESIGNATIONS_CLASSES}>
                <DialogHeader className="sr-only">
                  <DialogTitle>
                    {texts.cleaningTitle} - {shortLabel} - {formatFullNumeric(meeting.date)}
                  </DialogTitle>
                  <DialogDescription>
                    {title} · {formatLongDate(meeting.date, locale)}
                  </DialogDescription>
                </DialogHeader>
                <div className="sticky top-0 z-10 flex min-w-0 items-center justify-center bg-meeting px-12 py-4 text-white">
                  <p className="break-words text-center text-base font-semibold tracking-tight">
                    {texts.cleaningTitle} - {shortLabel} - {formatFullNumeric(meeting.date)}
                  </p>
                  <button
                    type="button"
                    onClick={() => setCleaningOpen(false)}
                    aria-label={t.common.close}
                    className="absolute top-1/2 right-2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-white/90 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <X className="size-5" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex min-w-0 flex-col divide-y divide-border px-4 pb-4">
                  {cleaningGroups.map((group) => {
                    // Espanhol quando cadastrado; senão cai no texto original.
                    const sectorLabel =
                      locale === "es" ? group.sectorNameEs || group.sectorName : group.sectorName;
                    const taskText = locale === "es" ? group.taskEs || group.task : group.task;
                    return (
                      <DutyRow
                        key={group.key}
                        post={sectorLabel}
                        detail={taskText}
                        person={group.people.join(" · ")}
                        icon={cleaningIconFor(group.sectorName)}
                      />
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>
          ) : null}
        </div>
      ) : null}

      {!displayedWeek.midweek && !displayedWeek.weekend ? (
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
        {new Date(displayedWeek.fetchedAt).toLocaleString(locale === "es" ? "es" : "pt-BR")}
      </p>
    </div>
  );
}
