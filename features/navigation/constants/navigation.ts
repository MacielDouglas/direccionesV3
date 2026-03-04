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
    id: "cards",
    name: "Tarjetas",
    href: "/cards",
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
    id: "users",
    name: "Usuarios",
    href: "/admin/users",
    icon: Users,
    roles: ["admin", "owner"],
  },
  {
    id: "user-cards",
    name: "Admin Tarjetas",
    href: "/admin/user-cards",
    icon: Layers,
    roles: ["admin", "owner"],
    children: [
      {
        id: "user-cards-manage",
        name: "Enviar Tarjetas",
        href: "/admin/user-cards/manage",
        icon: Layers,
      },
      {
        id: "user-cards-create",
        name: "Crear Tarjetas",
        href: "/admin/user-cards/create",
        icon: Plus,
      },
      {
        id: "user-cards-edit",
        name: "Editar Tarjetas",
        href: "/admin/user-cards/edit",
        icon: Pencil,
      },
    ],
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
