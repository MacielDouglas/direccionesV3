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
    "TESOROS DE LA BIBLIA": "TESOROS DE LA BIBLIA",
    "SEAMOS MEJORES MAESTROS": "SEAMOS MEJORES MAESTROS",
    "NUESTRA VIDA CRISTIANA": "NUESTRA VIDA CRISTIANA",
    "PUBLIC TALK": "Discurso público",
    "ESTUDIO DE LA ATALAYA": "Estudio de la Atalaya",
  },
  pt: {
    "TESOROS DE LA BIBLIA": "TESOUROS DA PALAVRA DE DEUS",
    "SEAMOS MEJORES MAESTROS": "FAÇA SEU MELHOR NO MINISTÉRIO",
    "NUESTRA VIDA CRISTIANA": "NOSSA VIDA CRISTÃ",
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

/** Partes sem número no programa (espelha UNNUMBERED_KEYS do impresso do Meeting). */
const UNNUMBERED_PART_KEYS = new Set([
  "opening-song",
  "middle-song",
  "closing-song",
  "watchtower-song",
  "opening-comments",
  "concluding-comments",
]);

/** Moldura do programa (nunca numerada, nunca com cabeçalho de seção). */
const FRAMING_PART_KEYS = new Set([
  "president",
  "opening-song",
  "opening-comments",
  "concluding-comments",
  "closing-song",
]);

/** Parte de conteúdo: tem número (cânticos e moldura ficam de fora). */
export function isCountedPart(part: MeetingAssignment): boolean {
  return (
    part.songNumber === null &&
    !UNNUMBERED_PART_KEYS.has(part.partKey) &&
    !FRAMING_PART_KEYS.has(part.partKey)
  );
}

export interface NumberedPart {
  part: MeetingAssignment;
  number: number | null;
}

export type BlockPlacement = "opening" | "content" | "closing";

export interface NumberedBlock {
  section: string;
  parts: NumberedPart[];
  /** Bloco com pelo menos uma parte numerada (únicos com cabeçalho). */
  hasCounted: boolean;
  /** Moldura antes do primeiro bloco numerado (abertura) ou após o último. */
  placement: BlockPlacement;
}

/** Numeração contínua das partes de conteúdo, na ordem do programa. */
export function numberProgramParts(blocks: MeetingBlock[]): NumberedBlock[] {
  let counter = 0;
  const numbered = blocks.map((block) => {
    const parts: NumberedPart[] = block.parts.map((item) => {
      if (!isCountedPart(item)) return { part: item, number: null };
      counter += 1;
      return { part: item, number: counter };
    });
    return { section: block.section, parts, hasCounted: parts.some((p) => p.number !== null) };
  });
  const firstCounted = numbered.findIndex((block) => block.hasCounted);
  const lastCounted = numbered.map((block) => block.hasCounted).lastIndexOf(true);
  return numbered.map((block, index) => {
    let placement: BlockPlacement = "content";
    if (!block.hasCounted && firstCounted !== -1) {
      if (index < firstCounted) placement = "opening";
      else if (index > lastCounted) placement = "closing";
    }
    return { ...block, placement };
  });
}
