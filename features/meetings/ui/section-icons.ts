import type { ProgramIcon } from "@/features/meetings/ui/program-parts";
import { MicVocal } from "lucide-react";
import type { IconType } from "react-icons";
import { FaBookOpen } from "react-icons/fa";
import { GiSheep } from "react-icons/gi";
import { IoDiamond } from "react-icons/io5";
import { LuWheat } from "react-icons/lu";

/** Ícones das seções do programa (chaves em espanhol do Meeting). */
export const SECTION_ICONS: Record<string, ProgramIcon> = {
  "TESOROS DE LA BIBLIA": IoDiamond,
  "SEAMOS MEJORES MAESTROS": LuWheat,
  "NUESTRA VIDA CRISTIANA": GiSheep,
  "PUBLIC TALK": MicVocal,
  "ESTUDIO DE LA ATALAYA": FaBookOpen,
};

export const DEFAULT_SECTION_ICON: IconType = FaBookOpen;

/**
 * Ícone da seção para o programa; null quando seria o livro aberto
 * (seção sem ícone próprio ou Estudo de A Sentinela) — nesses casos
 * o programa mostra só o título, sem caixa de ícone.
 */
export function sectionIconOf(section: string): ProgramIcon | null {
  const icon: ProgramIcon = SECTION_ICONS[section] ?? DEFAULT_SECTION_ICON;
  return icon === FaBookOpen ? null : icon;
}
