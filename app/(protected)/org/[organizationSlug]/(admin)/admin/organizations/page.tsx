import { BackLink } from "@/components/ui/BackLink";
import { getServerDictionary } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/users";
import { Building2, CalendarCheck, CreditCard, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ organizationSlug: string }>;
}

export default async function OrganizationsPage({ params }: Props) {
  const { organizationSlug } = await params;
  const [data, t] = await Promise.all([getCurrentUser(), getServerDictionary()]);
  if (!data) redirect("/login");

  const role = data.memberRole?.role;
  if (!data.isSuperUser && (!role || !["admin", "owner"].includes(role))) {
    redirect(`/org/${organizationSlug}`);
  }

  const organization = await prisma.organization.findUnique({
    where: { slug: organizationSlug },
    include: { _count: { select: { persons: true } } },
  });

  if (!organization) redirect("/");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:py-10">
      <BackLink href={`/org/${organizationSlug}/admin`} />
      <header className="flex items-center gap-3">
        <Building2 className="h-8 w-8 shrink-0 text-brand" aria-hidden="true" />
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
            {organization.name}
          </h1>
          <p className="truncate text-sm text-muted-foreground">/{organization.slug}</p>
        </div>
      </header>

      <section
        aria-label={t.admin.organizationsMemberCount.replace(
          "{count}",
          String(organization._count.persons),
        )}
        className="flex items-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground shadow-xs"
      >
        <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
        {t.admin.organizationsMemberCount.replace("{count}", String(organization._count.persons))}
      </section>

      <nav aria-label={t.admin.dashboard} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            href: `/org/${organizationSlug}/admin/gestao`,
            icon: <UserPlus className="size-4" aria-hidden="true" />,
            label: t.admin.gestaoTitle,
          },
          {
            href: `/org/${organizationSlug}/admin/cards`,
            icon: <CreditCard className="size-4" aria-hidden="true" />,
            label: t.admin.cards,
          },
          {
            href: `/org/${organizationSlug}/admin/agenda`,
            icon: <CalendarCheck className="size-4" aria-hidden="true" />,
            label: t.admin.agenda,
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <p className="text-sm text-muted-foreground">{t.admin.organizationsPageDescription}</p>
    </div>
  );
}
