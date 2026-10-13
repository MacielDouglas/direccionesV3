import type { IconType } from "react-icons";
import { FaBookOpen, FaMicrophone } from "react-icons/fa";
import { GiSheep } from "react-icons/gi";
import { IoDiamond } from "react-icons/io5";
import { LuWheat } from "react-icons/lu";

/** Ícones das seções do programa (chaves em espanhol do Meeting). */
export const SECTION_ICONS: Record<string, IconType> = {
  "TESOROS DE LA BIBLIA": IoDiamond,
  "SEAMOS MEJORES MAESTROS": LuWheat,
  "NUESTRA VIDA CRISTIANA": GiSheep,
  "PUBLIC TALK": FaMicrophone,
  "ESTUDIO DE LA ATALAYA": FaBookOpen,
};

export const DEFAULT_SECTION_ICON: IconType = FaBookOpen;
