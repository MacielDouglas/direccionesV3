import { getServerDictionary } from "@/lib/i18n/server";
import { getCurrentUser } from "@/server/users";
import {
  CalendarCheck,
  ChevronRight,
  CreditCard,
  KeyRound,
  Plus,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ organizationSlug: string }>;
}

export default async function AdminPage({ params }: Props) {
  const { organizationSlug } = await params;
  const [data, t] = await Promise.all([getCurrentUser(), getServerDictionary()]);

  if (!data) redirect("/login");

  const role = data.memberRole?.role;
  if (!data.isSuperUser && (!role || !["admin", "owner"].includes(role))) {
    redirect(`/org/${organizationSlug}`);
  }

  const isOwner = role === "owner" || data.isSuperUser;
  const orgName = data.activeOrganization?.name ?? "Organización";
  const slug = data.activeOrganization?.slug ?? organizationSlug;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 md:py-10" aria-labelledby="admin-heading">
      {/* Cabeçalho */}
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">
          {t.admin.title}
        </p>
        <h1 id="admin-heading" className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {orgName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.admin.subtitle}</p>
      </header>

      <div className="space-y-8">
        {/* Hero — criar pessoa */}
        <Link
          href={`/org/${slug}/admin/pessoas`}
          className="group flex items-center justify-between gap-4 rounded-2xl bg-black p-6 text-white shadow-md shadow-black/20 transition-transform active:scale-[0.99] sm:p-8"
        >
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-neutral-400">
              <UserPlus className="size-4" aria-hidden="true" />
              {t.admin.people}
            </span>
            <p className="mt-3 max-w-md text-lg font-semibold leading-snug sm:text-xl">
              {t.admin.peopleDescription}
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90">
              <Plus className="size-4" aria-hidden="true" />
              {t.people.createButton}
            </span>
          </div>
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 text-white transition-transform group-hover:translate-x-0.5">
            <ChevronRight className="size-5" aria-hidden="true" />
          </span>
        </Link>

        {/* Gestão */}
        <section aria-labelledby="manage-heading">
          <h2
            id="manage-heading"
            className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground"
          >
            <ShieldCheck className="size-4 text-brand" aria-hidden="true" />
            {t.admin.dashboard}
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <AdminAction
              href={`/org/${slug}/admin/cards`}
              icon={<CreditCard className="size-5 text-brand" aria-hidden="true" />}
              title={t.admin.cards}
              description={t.admin.cardsDescription}
              cta={t.admin.open}
            />
            <AdminAction
              href={`/org/${slug}/admin/agenda`}
              icon={<CalendarCheck className="size-5 text-brand" aria-hidden="true" />}
              title={t.admin.agenda}
              description={t.admin.agendaDescription}
              cta={t.admin.open}
            />
            <AdminAction
              href={`/org/${slug}/admin/invitations`}
              icon={<KeyRound className="size-5 text-brand" aria-hidden="true" />}
              title={t.admin.invitations}
              description={t.admin.invitationsDescription}
              cta={t.admin.open}
            />
            <AdminAction
              href={`/org/${slug}/admin/usuarios`}
              icon={<Users className="size-5 text-brand" aria-hidden="true" />}
              title={t.admin.users}
              description={t.admin.usersDescription}
              cta={t.admin.open}
            />
            {isOwner && (
              <AdminAction
                href={`/org/${slug}/admin/organizations`}
                icon={<ShieldCheck className="size-5 text-brand" aria-hidden="true" />}
                title={t.admin.organizations}
                description={t.admin.organizationsDescription}
                cta={t.admin.open}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function AdminAction({
  href,
  icon,
  title,
  description,
  cta,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-xs transition-colors hover:bg-surface-subtle-light dark:hover:bg-surface-subtle-dark"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/10">
          {icon}
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{description}</p>
          <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-brand">
            {cta}
            <ChevronRight
              className="size-3 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
