// src/constants/navigation.ts
import {
  Home,
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

export type UserRole = "null" | "member" | "admin" | "owner";

export type NavigationItem = {
  id: string;
  name: string;
  href: string;
  icon: React.ElementType;
  roles?: UserRole[]; // se não existir, todos podem ver
  children?: NavigationItem[];
};

export const navigationMenu: NavigationItem[] = [
  {
    id: "home",
    name: "Home",
    href: "/",
    icon: Home,
  },

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
        name: "Buscar Dirección",
        href: "/addresses/search",
        icon: Search,
      },
      {
        id: "addresses-edit",
        name: "Editar Dirección",
        href: "/addresses/update",
        icon: Pencil,
      },
    ],
  },

  {
    id: "user",
    name: "Perfil",
    href: "/user",
    icon: User,
  },

  // 🔐 ADMIN
  {
    id: "users",
    name: "Usuarios",
    href: `/admin/users`,
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

  // 👑 OWNER
  {
    id: "admin",
    name: "Admin - Organizations",
    href: "/admin/organizations",
    icon: Shield,
    roles: ["owner"],
  },
];

export function getNavigationByRole(
  menu: NavigationItem[],
  role: UserRole,
): NavigationItem[] {
  console.log("tipo de Role", role);
  return menu
    .filter((item) => !item.roles || item.roles.includes(role))
    .map((item) => ({
      ...item,
      children: item.children
        ? item.children.filter(
            (child) => !child.roles || child.roles.includes(role),
          )
        : undefined,
    }));
}
