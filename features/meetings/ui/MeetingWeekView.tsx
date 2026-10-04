"use client";

import type { StoredWeekProgram } from "@/features/meetings/application/meeting.service";
import {
  type MeetingAssignment,
  type MeetingLocale,
  meetingSectionMetaOf,
  splitMeetingBlocks,
} from "@/features/meetings/domain/meeting-section";
import type { MeetingDetail } from "@/features/meetings/domain/meeting.schema";
import type { I18nDictionary } from "@/lib/i18n/types";
import { type CSSProperties, useState } from "react";
import type { IconType } from "react-icons";
import { FaBookOpen, FaHandsHelping, FaMicrophone } from "react-icons/fa";
import { GiSheep } from "react-icons/gi";
import { IoDiamond } from "react-icons/io5";
import { LuWheat } from "react-icons/lu";

type Texts = I18nDictionary["meetings"];
type MeetingKind = "midweek" | "weekend";

const SECTION_ICONS: Record<string, IconType> = {
  "TESOROS DE LA BIBLIA": IoDiamond,
  "SEAMOS MEJORES MAESTROS": LuWheat,
  "NUESTRA VIDA CRISTIANA": GiSheep,
  "PUBLIC TALK": FaMicrophone,
  "ESTUDIO DE LA ATALAYA": FaBookOpen,
};

function parseDay(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

function shortMonth(date: Date, locale: MeetingLocale): string {
  return new Intl.DateTimeFormat(locale === "es" ? "es" : "pt-BR", { month: "short" })
    .format(date)
    .replace(/\./g, "")
    .toLowerCase();
}

function formatRange(startIso: string, endIso: string, locale: MeetingLocale): string {
  const start = parseDay(startIso);
  const end = parseDay(endIso);
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()} – ${end.getDate()} ${shortMonth(end, locale)}`;
  }
  return `${start.getDate()} ${shortMonth(start, locale)} – ${end.getDate()} ${shortMonth(end, locale)}`;
}

function formatLong(iso: string, locale: MeetingLocale): string {
  const text = new Intl.DateTimeFormat(locale === "es" ? "es" : "pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(parseDay(iso));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatShortDay(iso: string, locale: MeetingLocale): string {
  const date = parseDay(iso);
  return `${date.getDate()} ${shortMonth(date, locale)}`;
}

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

function PartRow({
  part,
  color,
  texts,
}: {
  part: MeetingAssignment;
  color: string;
  texts: Texts;
}) {
  const names = [part.personName, part.helperPersonName].filter(Boolean).join(" · ");
  const title = part.songNumber ? `${texts.song} ${part.songNumber}` : part.title;
  const subtitle = [
    part.subtitle,
    part.songTheme,
    part.speakerCongregation ? `(${part.speakerCongregation})` : "",
    part.durationMinutes ? `${part.durationMinutes} min` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <article
      aria-label={names ? `${title} — ${names}` : title}
      className="flex w-full items-start gap-3 py-3"
    >
      <TimeBadge className="text-white" style={{ backgroundColor: color }}>
        {part.startTime}
      </TimeBadge>
      <span className="min-w-0 flex-1">
        <span title={title} className="block truncate text-sm font-semibold text-foreground">
          {title}
        </span>
        {subtitle ? (
          <span className="mt-0.5 block text-xs text-muted-foreground">{subtitle}</span>
        ) : null}
        {names ? (
          <span className="mt-0.5 block text-right">
            <span className="block truncate text-sm font-semibold text-foreground">{names}</span>
          </span>
        ) : null}
      </span>
    </article>
  );
}

function DutyRow({
  date,
  post,
  detail,
  person,
  locale,
  badgeClassName = "bg-brand text-brand-foreground",
}: {
  date: string;
  post: string;
  detail?: string;
  person: string;
  locale: MeetingLocale;
  badgeClassName?: string;
}) {
  return (
    <article
      aria-label={person ? `${post} — ${person}` : post}
      className="flex w-full items-start gap-3 py-3"
    >
      <TimeBadge className={badgeClassName}>{formatShortDay(date, locale)}</TimeBadge>
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

function SectionHeader({
  label,
  color,
  icon: Icon,
}: {
  label: string;
  color: string;
  icon: IconType;
}) {
  return (
    <div className="flex items-center gap-3 py-4">
      <span
        aria-hidden
        className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-white"
        style={{ backgroundColor: color }}
      >
        <Icon size={30} />
      </span>
      <span className="text-2xl font-semibold leading-tight tracking-tight" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

function MeetingPanel({
  meeting,
  title,
  dutyItems,
  texts,
  locale,
}: {
  meeting: MeetingDetail;
  title: string;
  dutyItems: { date: string; post: string; person: string }[];
  texts: Texts;
  locale: MeetingLocale;
}) {
  const blocks = splitMeetingBlocks(meeting.assignments);
  return (
    <section
      aria-label={title}
      className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs"
    >
      <div className="sticky top-0 z-10 flex items-baseline justify-between gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
        <p className="truncate text-sm font-medium text-muted-foreground">{title}</p>
        <p className="shrink-0 text-sm font-medium tabular-nums text-muted-foreground">
          <time dateTime={meeting.date}>{formatShortDay(meeting.date, locale)}</time>
        </p>
      </div>
      <div className="flex flex-col divide-y divide-border px-4">
        {meeting.assignments.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">{texts.noAssignments}</p>
        ) : null}
        {blocks.map((block, blockIndex) => {
          const meta = meetingSectionMetaOf(block.section, locale);
          const SectionIcon = SECTION_ICONS[block.section] ?? FaBookOpen;
          return (
            <div key={`${block.section}-${blockIndex}`}>
              <SectionHeader label={meta.label} color={meta.color} icon={SectionIcon} />
              {block.parts.map((part, partIndex) => (
                <PartRow
                  key={`${part.partKey}-${partIndex}`}
                  part={part}
                  color={meta.color}
                  texts={texts}
                />
              ))}
            </div>
          );
        })}
        {dutyItems.length > 0 ? (
          <div>
            <SectionHeader
              label={texts.dutiesTitle}
              color="var(--color-brand)"
              icon={FaHandsHelping}
            />
            {dutyItems.map((duty, dutyIndex) => (
              <DutyRow
                key={`${duty.date}-${duty.post}-${dutyIndex}`}
                date={duty.date}
                post={duty.post}
                person={duty.person}
                locale={locale}
              />
            ))}
          </div>
        ) : null}
      </div>
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
  const kinds: MeetingKind[] = [
    ...(week.midweek ? (["midweek"] as const) : []),
    ...(week.weekend ? (["weekend"] as const) : []),
  ];
  const [kind, setKind] = useState<MeetingKind>(kinds[0] ?? "midweek");
  const meeting = kind === "midweek" ? week.midweek : week.weekend;
  const title = kind === "midweek" ? texts.midweekTitle : texts.weekendTitle;
  const shortLabel = kind === "midweek" ? texts.midweekShort : texts.weekendShort;
  const dutyItems = week.duties
    .filter((duty) => duty.meetingKind === kind)
    .map((duty) => ({ date: duty.date, post: duty.postLabel, person: duty.personName }));

  return (
    <div className="flex flex-col gap-4">
      {(week.midweek || week.weekend) && (
        <fieldset className="flex rounded-xl bg-muted p-1">
          <legend className="sr-only">{texts.title}</legend>
          {(["midweek", "weekend"] as const).map((option) => {
            const present = kinds.includes(option);
            const active = kind === option;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                disabled={!present}
                onClick={() => setKind(option)}
                className={`h-11 flex-1 rounded-lg text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 ${
                  active
                    ? "bg-card font-semibold text-foreground shadow-sm"
                    : "font-medium text-muted-foreground hover:text-foreground"
                }`}
              >
                {option === "midweek" ? texts.midweekShort : texts.weekendShort}
              </button>
            );
          })}
        </fieldset>
      )}

      {meeting ? (
        <div className="flex min-w-0 flex-col items-center gap-1 py-1 text-center">
          <p className="truncate text-2xl font-semibold leading-none tracking-tight text-foreground">
            {formatRange(week.weekStart, week.weekEnd, locale)}
          </p>
          <p className="truncate text-sm font-medium text-muted-foreground">
            {shortLabel} · {formatLong(meeting.date, locale)}
          </p>
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
          dutyItems={dutyItems}
          texts={texts}
          locale={locale}
        />
      ) : null}

      {week.cleaning.length > 0 ? (
        <section
          aria-label={texts.cleaningTitle}
          className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs"
        >
          <div className="flex items-baseline justify-between gap-3 border-b border-border px-4 py-3">
            <p className="truncate text-sm font-medium text-foreground">{texts.cleaningTitle}</p>
          </div>
          <div className="flex flex-col divide-y divide-border px-4">
            {week.cleaning.map((item, itemIndex) => (
              <DutyRow
                key={`${item.date}-${item.sectorName}-${itemIndex}`}
                date={item.date}
                post={item.sectorName}
                detail={item.task}
                person={item.personName}
                locale={locale}
                badgeClassName="bg-muted text-foreground"
              />
            ))}
          </div>
        </section>
      ) : null}

      <p className="text-xs text-muted-foreground">
        {texts.fetchedAt}{" "}
        {new Date(week.fetchedAt).toLocaleString(locale === "es" ? "es" : "pt-BR")}
      </p>
    </div>
  );
}
