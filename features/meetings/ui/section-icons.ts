import type { ProgramIcon } from "@/features/meetings/ui/program-parts";
import { BookOpen, MicVocal, Wheat } from "lucide-react";
import { GiSheep } from "react-icons/gi";
import { IoDiamond } from "react-icons/io5";

/** Ícones das seções do programa (chaves em espanhol do Meeting). */
export const SECTION_ICONS: Record<string, ProgramIcon> = {
  "TESOROS DE LA BIBLIA": IoDiamond,
  "SEAMOS MEJORES MAESTROS": Wheat,
  // Sem equivalente no lucide: ovelha é o visual da Vida Cristã no impresso.
  "NUESTRA VIDA CRISTIANA": GiSheep,
  "PUBLIC TALK": MicVocal,
  "ESTUDIO DE LA ATALAYA": BookOpen,
};

export const DEFAULT_SECTION_ICON: ProgramIcon = BookOpen;

/**
 * Ícone da seção para o programa; null quando seria o livro aberto
 * (seção sem ícone próprio ou Estudo de A Sentinela) — nesses casos
 * o programa mostra só o título, sem caixa de ícone.
 */
export function sectionIconOf(section: string): ProgramIcon | null {
  const icon: ProgramIcon = SECTION_ICONS[section] ?? DEFAULT_SECTION_ICON;
  return icon === BookOpen ? null : icon;
}
