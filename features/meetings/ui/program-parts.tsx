import type { MeetingAssignment } from "@/features/meetings/domain/meeting-section";
import type { MeetingDuty } from "@/features/meetings/domain/meeting.schema";
import { cn } from "@/lib/utils";
import { BrushCleaning, Crown, MicVocal, Toilet, Trash, createLucideIcon } from "lucide-react";
import type { ComponentType } from "react";
import {
  FaChair,
  FaDoorOpen,
  FaHandsHelping,
  FaParking,
  FaTree,
  FaUserCheck,
  FaUtensils,
  FaVideo,
  FaVolumeUp,
} from "react-icons/fa";

/** Ícone do programa: react-icons ou lucide com prop `size`. */
export type ProgramIcon = ComponentType<{ size?: string | number; className?: string }>;

export const CupSoda = createLucideIcon("cup-soda", [
  ["path", { d: "M5 8h14", key: "pcz4l3" }],
  [
    "path",
    {
      d: "m6 8 1.75 12.28a2 2 0 002 1.72h4.54a2 2 0 002-1.72L18 8",
      key: "19a75o",
    },
  ],
  ["path", { d: "M7 15a6.47 6.47 0 015 0 6.47 6.47 0 005 0", key: "yhud5w" }],
]);

/**
 * Blocos visuais do programa, compartilhados entre o modal da home
 * (`NextMeetingSection`) e a página de reuniões (`MeetingWeekView`).
 */

/** Bottom-sheet mobile do programa (mesmo padrão do AddressDetailModal). */
export const MEETING_SHEET_CLASSES = cn(
  "fixed z-50 gap-0",
  "max-h-[92dvh] w-full max-w-full overflow-x-hidden overflow-y-auto p-0",
  "left-0! right-0! bottom-0! top-auto! rounded-t-3xl! border-0!",
  "translate-x-0! translate-y-0!",
  "sm:left-1/2! sm:right-auto! sm:top-1/2! sm:bottom-auto! sm:-translate-x-1/2! sm:-translate-y-1/2!",
  "sm:max-w-lg! sm:rounded-3xl! sm:border! sm:max-h-[90dvh]",
);

/** Variante estreita do sheet, para listas curtas (designações, limpeza). */
export const MEETING_SHEET_NARROW_CLASSES = cn(
  "fixed z-50 gap-0",
  "max-h-[92dvh] w-full max-w-full overflow-x-hidden overflow-y-auto p-0",
  "left-0! right-0! bottom-0! top-auto! rounded-t-3xl! border-0!",
  "translate-x-0! translate-y-0!",
  "sm:left-1/2! sm:right-auto! sm:top-1/2! sm:bottom-auto! sm:-translate-x-1/2! sm:-translate-y-1/2!",
  "sm:max-w-md! sm:rounded-3xl! sm:border! sm:max-h-[90dvh]",
);

/** Sheet das designações: flutua acima do nav-bottom (h-16 + safe-area). */
export const MEETING_SHEET_DESIGNATIONS_CLASSES = cn(
  "fixed z-50 gap-0",
  "max-h-[92dvh] w-full max-w-full overflow-x-hidden overflow-y-auto p-0",
  "left-0! right-0! top-auto! rounded-t-3xl! border-0!",
  "bottom-[calc(4rem+env(safe-area-inset-bottom,0px))]!",
  "translate-x-0! translate-y-0!",
  "sm:left-1/2! sm:right-auto! sm:top-1/2! sm:bottom-auto! sm:-translate-x-1/2! sm:-translate-y-1/2!",
  "sm:max-w-md! sm:rounded-3xl! sm:border! sm:max-h-[90dvh]",
);

function normalizeToken(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase();
}

/** Ícone da designação pelo cargo (recepcionistas, som, vídeo...). */
export function dutyIconFor(postLabel: string): ProgramIcon {
  const post = normalizeToken(postLabel);
  if (/(INTERN|EXTERN|ACOMODADOR|INDICADOR)/.test(post)) return FaUserCheck;
  if (/(SOM|SONIDO|AUDIO|MICROFONE|MICROFONO)/.test(post)) return FaVolumeUp;
  if (/(VIDEO|PROYEC|TELA|PANTALLA)/.test(post)) return FaVideo;
  if (/(PALCO|PLATAFORMA)/.test(post)) return MicVocal;
  return FaHandsHelping;
}

/** Ícone do setor de limpeza (banheiros, cozinha, salão...). */
export function cleaningIconFor(sectorName: string): ProgramIcon {
  const sector = normalizeToken(sectorName);
  if (/(BANHEIR|BANO|WC|SANITARIO)/.test(sector)) return Toilet;
  if (/(COZINHA|COCINA)/.test(sector)) return FaUtensils;
  if (/(ESTACIONAMENTO|ESTACIONAMIENTO|PARKING)/.test(sector)) return FaParking;
  if (/(SALAO|SALON|AUDITORIO|\bSALA)/.test(sector)) return FaChair;
  if (/(ENTRADA|LOBBY|PORTA|PUERTA)/.test(sector)) return FaDoorOpen;
  if (/(JARDIM|JARDIN|PATIO|QUINTAL)/.test(sector)) return FaTree;
  if (/(BASURA|LIXO|RESIDUO)/.test(sector)) return Trash;
  if (/(REABASTEC|REPOS)/.test(sector)) return CupSoda;
  return BrushCleaning;
}

export function ProgramPartRow({
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

export function ProgramSectionHeader({
  label,
  color,
  icon,
  titleClassName,
}: {
  label: string;
  /** Cor da caixa do ícone; também pinta o título, salvo `titleClassName`. */
  color: string;
  icon: ProgramIcon | null;
  titleClassName?: string;
}) {
  const Icon = icon;
  return (
    <div className="flex items-center gap-3 py-2">
      {Icon ? (
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-xl text-white"
          style={{ backgroundColor: color }}
        >
          <Icon size={20} />
        </span>
      ) : null}
      <h3
        className={cn(
          "min-w-0 flex-1 break-words text-xl font-bold uppercase leading-tight tracking-tight",
          titleClassName,
        )}
        style={titleClassName ? undefined : { color }}
      >
        {label}
      </h3>
    </div>
  );
}

export function ProgramPresidentRow({ duties }: { duties: MeetingDuty[] }) {
  if (duties.length === 0) return null;
  return (
    <ul className="px-4">
      {duties.map((duty, dutyIndex) => (
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
  );
}
