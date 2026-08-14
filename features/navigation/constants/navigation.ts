import type { Role } from "@/domains/member/types/role.types";
import type { I18nDictionary } from "@/lib/i18n/types";
import {
  CalendarDays,
  CreditCard,
  Home,
  MapPin,
  Plus,
  ScanSearch,
  Search,
  Shield,
  User,
} from "lucide-react";
import type { ElementType } from "react";

export type NavigationItem = {
  id: string;
  name: string;
  label?: keyof I18nDictionary["navigation"];
  href: string;
  icon: ElementType;
  roles?: Role[];
  children?: NavigationItem[];
};

export const navigationMenu: NavigationItem[] = [
  {
    id: "home",
    name: "Inicio",
    label: "homeLabel",
    href: "/",
    icon: Home,
  },
  {
    id: "my-cards", // ← era "cards", renomeado
    name: "Mis Tarjetas",
    label: "myCardsLabel",
    href: "/my-cards",
    icon: CreditCard,
  },
  {
    id: "addresses",
    name: "Direcciones",
    label: "addressesLabel",
    href: "/addresses",
    icon: MapPin,
    children: [
      {
        id: "addresses-new",
        name: "Nueva Dirección",
        label: "newAddress",
        href: "/addresses/new",
        icon: Plus,
      },
      {
        id: "addresses-locate",
        name: "Todas las Direcciones",
        label: "allAddresses",
        href: "/addresses",
        icon: Search,
      },
    ],
  },
  {
    id: "user",
    name: "Perfil",
    label: "profileLabel",
    href: "/user",
    icon: User,
  },
  {
    id: "busqueda",
    name: "Busqueda",
    label: "surveyLabel",
    href: "/surveys",
    icon: ScanSearch,
  },

  {
    id: "agenda",
    name: "Cronograma",
    label: "agendaLabel",
    href: "/agenda",
    icon: CalendarDays,
  },
  {
    id: "admin",
    name: "Administración",
    label: "administration",
    href: "/admin",
    icon: Shield,
    roles: ["admin", "owner"],
  },
];

export function getNavigationByRole(menu: NavigationItem[], role: Role): NavigationItem[] {
  return menu
    .filter((item) => !item.roles || item.roles.includes(role))
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => !child.roles || child.roles.includes(role)),
    }));
}
