import type { MeetingDetail } from "@/features/meetings/domain/meeting.schema";

export type MeetingLocale = "pt" | "es";

export interface MeetingSectionMeta {
  label: string;
  color: string;
}

export const DEFAULT_MEETING_SECTION_COLOR = "#63636b";

/** Cores oficiais das seções (iguais nos dois idiomas). */
const SECTION_COLORS: Record<string, string> = {
  "TESOROS DE LA BIBLIA": "#3c7f8b",
  "SEAMOS MEJORES MAESTROS": "#d68f00",
  "NUESTRA VIDA CRISTIANA": "#bf2f13",
  "PUBLIC TALK": "#2f4868",
  "ESTUDIO DE LA ATALAYA": "#4d654d",
};

const SECTION_LABELS: Record<MeetingLocale, Record<string, string>> = {
  es: {
    "TESOROS DE LA BIBLIA": "Tesoros de la Biblia",
    "SEAMOS MEJORES MAESTROS": "Seamos mejores maestros",
    "NUESTRA VIDA CRISTIANA": "Nuestra vida cristiana",
    "PUBLIC TALK": "Discurso público",
    "ESTUDIO DE LA ATALAYA": "Estudio de la Atalaya",
  },
  pt: {
    "TESOROS DE LA BIBLIA": "Tesouros da Bíblia",
    "SEAMOS MEJORES MAESTROS": "Sejamos melhores professores",
    "NUESTRA VIDA CRISTIANA": "Nossa vida cristã",
    "PUBLIC TALK": "Discurso público",
    "ESTUDIO DE LA ATALAYA": "Estudo de A Sentinela",
  },
};

export function meetingSectionMetaOf(section: string, locale: MeetingLocale): MeetingSectionMeta {
  return {
    label: SECTION_LABELS[locale][section] ?? section,
    color: SECTION_COLORS[section] ?? DEFAULT_MEETING_SECTION_COLOR,
  };
}

export type MeetingAssignment = MeetingDetail["assignments"][number];

export interface MeetingBlock {
  section: string;
  parts: MeetingAssignment[];
}

/** Agrupa partes consecutivas da mesma seção, preservando a ordem do programa. */
export function splitMeetingBlocks(assignments: MeetingAssignment[]): MeetingBlock[] {
  const blocks: MeetingBlock[] = [];
  for (const part of assignments) {
    const current = blocks[blocks.length - 1];
    if (current && current.section === part.section) {
      current.parts.push(part);
    } else {
      blocks.push({ section: part.section, parts: [part] });
    }
  }
  return blocks;
}
