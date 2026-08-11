import type { Role } from "@/domains/member/types/role.types";
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
  label?: string;
  href: string;
  icon: ElementType;
  roles?: Role[];
  children?: NavigationItem[];
};

export const navigationMenu: NavigationItem[] = [
  {
    id: "home",
    name: "Inicio",
    href: "/",
    icon: Home,
  },
  {
    id: "my-cards", // ← era "cards", renomeado
    name: "Mis Tarjetas",
    href: "/my-cards",
    icon: CreditCard,
  },
  {
    id: "addresses",
    name: "Direcciones",
    href: "/addresses",
    icon: MapPin,
    children: [
      {
        id: "addresses-new",
        name: "Nueva Dirección",
        href: "/addresses/new",
        icon: Plus,
      },
      {
        id: "addresses-locate",
        name: "Todas las Direcciones",
        href: "/addresses",
        icon: Search,
      },
    ],
  },
  {
    id: "user",
    name: "Perfil",
    href: "/user",
    icon: User,
  },
  {
    id: "busqueda",
    name: "Busqueda",
    href: "/surveys",
    icon: ScanSearch,
  },

  {
    id: "agenda",
    name: "Cronograma",
    href: "/agenda",
    icon: CalendarDays,
  },
  {
    id: "admin",
    name: "Administración",
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
