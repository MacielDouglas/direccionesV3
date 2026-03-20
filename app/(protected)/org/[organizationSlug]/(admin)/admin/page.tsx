import { getCurrentUser } from "@/server/users";
import { redirect } from "next/navigation";
import {
  Users,
  Layers,
  CalendarCheck,
  Link2,
  Shield,
  Plus,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import type { ElementType } from "react";

interface AdminCard {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: ElementType;
  color: string;
  children?: { name: string; href: string; icon: ElementType }[];
  ownerOnly?: boolean;
}

const ADMIN_CARDS: AdminCard[] = [
  {
    id: "users",
    title: "Usuarios",
    description: "Gestiona los miembros de la organización y sus roles.",
    href: "/admin/users",
    icon: Users,
    color:
      "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
  },
  {
    id: "cards",
    title: "Tarjetas",
    description: "Administra y crea tarjetas para los publicadores.",
    href: "/admin/cards",
    icon: Layers,
    color:
      "bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:border-violet-800",
    children: [
      { name: "Administrar", href: "/admin/cards", icon: Pencil },
      { name: "Crear nueva", href: "/admin/cards/new", icon: Plus },
    ],
  },
  {
    id: "agenda",
    title: "Programar Cronograma",
    description: "Crea y gestiona los eventos del cronograma mensual.",
    href: "/admin/agenda",
    icon: CalendarCheck,
    color:
      "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800",
  },
  {
    id: "invitations",
    title: "Invitar Usuarios",
    description: "Genera invitaciones para nuevos miembros de la organización.",
    href: "/admin/invitations",
    icon: Link2,
    color:
      "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
  },
  {
    id: "organizations",
    title: "Organizaciones",
    description: "Administra todas las organizaciones del sistema.",
    href: "/admin/organizations",
    icon: Shield,
    color: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
    ownerOnly: true,
  },
];

export default async function AdminPage() {
  // const { slug } = await params;
  const session = await getCurrentUser();
  const slug = session?.activeOrganization?.slug;
  // console.log(session?.activeOrganization?.slug);

  if (!session) redirect("/login");

  const role = session.memberRole?.role;
  if (!role || !["admin", "owner"].includes(role)) {
    redirect(`/org/${slug}`);
  }

  const isOwner = role === "owner";
  const visibleCards = ADMIN_CARDS.filter((c) => !c.ownerOnly || isOwner);

  return (
    <main
      className="mx-auto w-full max-w-3xl px-4 py-6"
      aria-labelledby="admin-heading"
    >
      {/* Header */}
      <header className="mb-6">
        <h1 id="admin-heading" className="text-2xl font-bold tracking-tight">
          Panel de administración
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestiona usuarios, tarjetas, cronograma e invitaciones.
        </p>
      </header>

      {/* Grid de cards */}
      <ul
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        aria-label="Opciones de administración"
      >
        {visibleCards.map((card) => {
          const Icon = card.icon;
          return (
            <li key={card.id}>
              <div
                className={`flex flex-col gap-3 rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md ${card.color}`}
              >
                {/* Ícone + título */}
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-white/70 p-2.5 dark:bg-black/20 shrink-0">
                    <Icon className="size-5 text-foreground" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold leading-tight">
                      {card.title}
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>

                {/* Ações */}
                {card.children ? (
                  <div className="flex flex-wrap gap-2">
                    {card.children.map((child) => {
                      const ChildIcon = child.icon;
                      return (
                        <Link
                          key={child.href}
                          href={`/org/${slug}${child.href}`}
                          className="flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-white dark:bg-black/20 dark:hover:bg-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={`${child.name} — ${card.title}`}
                        >
                          <ChildIcon className="size-3.5" aria-hidden />
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <Link
                    href={`/org/${slug}${card.href}`}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/80 px-3 py-2 text-xs font-medium shadow-sm transition-colors hover:bg-white dark:bg-black/20 dark:hover:bg-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Ir a ${card.title}`}
                  >
                    Abrir
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
