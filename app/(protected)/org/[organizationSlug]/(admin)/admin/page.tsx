import { dictionaries } from "@/lib/i18n/dictionaries";
import { getServerLocale } from "@/lib/i18n/server";
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
  const [data, locale] = await Promise.all([getCurrentUser(), getServerLocale()]);

  if (!data) redirect("/login");

  const role = data.memberRole?.role;
  if (!data.isSuperUser && (!role || !["admin", "owner"].includes(role))) {
    redirect(`/org/${organizationSlug}`);
  }

  const isOwner = role === "owner" || data.isSuperUser;
  const orgName = data.activeOrganization?.name ?? "Organización";
  const slug = data.activeOrganization?.slug ?? organizationSlug;

  const t = dictionaries[locale];
  const altLocale = locale === "pt" ? "es" : "pt";
  const tAlt = dictionaries[altLocale];

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
              titleAlt={tAlt.admin.cards}
              description={t.admin.cardsDescription}
              descriptionAlt={tAlt.admin.cardsDescription}
              cta={t.admin.open}
            />
            <AdminAction
              href={`/org/${slug}/admin/agenda`}
              icon={<CalendarCheck className="size-5 text-brand" aria-hidden="true" />}
              title={t.admin.agenda}
              titleAlt={tAlt.admin.agenda}
              description={t.admin.agendaDescription}
              descriptionAlt={tAlt.admin.agendaDescription}
              cta={t.admin.open}
            />
            <AdminAction
              href={`/org/${slug}/admin/invitations`}
              icon={<KeyRound className="size-5 text-brand" aria-hidden="true" />}
              title={t.admin.invitations}
              titleAlt={tAlt.admin.invitations}
              description={t.admin.invitationsDescription}
              descriptionAlt={tAlt.admin.invitationsDescription}
              cta={t.admin.open}
            />
            <AdminAction
              href={`/org/${slug}/admin/usuarios`}
              icon={<Users className="size-5 text-brand" aria-hidden="true" />}
              title={t.admin.users}
              titleAlt={tAlt.admin.users}
              description={t.admin.usersDescription}
              descriptionAlt={tAlt.admin.usersDescription}
              cta={t.admin.open}
            />
            {isOwner && (
              <AdminAction
                href={`/org/${slug}/admin/organizations`}
                icon={<ShieldCheck className="size-5 text-brand" aria-hidden="true" />}
                title={t.admin.organizations}
                titleAlt={tAlt.admin.organizations}
                description={t.admin.organizationsDescription}
                descriptionAlt={tAlt.admin.organizationsDescription}
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
  titleAlt,
  description,
  descriptionAlt,
  cta,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  titleAlt?: string;
  description: string;
  descriptionAlt?: string;
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
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <h3 className="truncate text-sm font-semibold text-foreground">{title}</h3>
            {titleAlt && titleAlt !== title ? (
              <span className="truncate text-xs font-normal text-muted-foreground/80">
                / {titleAlt}
              </span>
            ) : null}
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{description}</p>
          {descriptionAlt && descriptionAlt !== description ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground/70">{descriptionAlt}</p>
          ) : null}
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand">
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
