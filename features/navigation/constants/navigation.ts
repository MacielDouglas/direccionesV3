import {
  CreditCard,
  MapPin,
  User,
  Users,
  Shield,
  Layers,
  Plus,
  Search,
  Pencil,
  ScanSearch,
  CalendarDays,
  CalendarCheck,
  Link2,
} from "lucide-react";
import type { ElementType } from "react";
import type { Role } from "@/domains/member/types/role.types";

export type NavigationItem = {
  id: string;
  name: string;
  href: string;
  icon: ElementType;
  roles?: Role[];
  children?: NavigationItem[];
};

export const navigationMenu: NavigationItem[] = [
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
    id: "users",
    name: "Usuarios",
    href: "/admin/users",
    icon: Users,
    roles: ["admin", "owner"],
  },
  {
    id: "admin-cards", // ← era "cards", renomeado
    name: "Admin Tarjetas",
    href: "/admin/cards",
    icon: Layers,
    roles: ["admin", "owner"],
    children: [
      {
        id: "user-cards-manage",
        name: "Administrar Tarjetas",
        href: "/admin/cards",
        icon: Pencil,
      },
      {
        id: "user-cards-create",
        name: "Crear Tarjetas",
        href: "/admin/cards/new",
        icon: Plus,
      },
    ],
  },
  {
    id: "admin-agenda",
    name: "Programar Cronograma",
    href: "/admin/agenda",
    icon: CalendarCheck,
    roles: ["admin", "owner"],
  },
  {
    id: "invitation-org",
    name: "Invitar Usuarios",
    href: "/admin/invitations",
    icon: Link2, // import { Link2 } from "lucide-react"
    roles: ["admin", "owner"], // só aparece para admin/owner
  },
  {
    id: "admin",
    name: "Admin - Organizaciones",
    href: "/admin/organizations",
    icon: Shield,
    roles: ["owner"],
  },
];

export function getNavigationByRole(
  menu: NavigationItem[],
  role: Role,
): NavigationItem[] {
  return menu
    .filter((item) => !item.roles || item.roles.includes(role))
    .map((item) => ({
      ...item,
      children: item.children?.filter(
        (child) => !child.roles || child.roles.includes(role),
      ),
    }));
}
