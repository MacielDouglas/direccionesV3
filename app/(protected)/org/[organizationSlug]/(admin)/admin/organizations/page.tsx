import { BackLink } from "@/components/ui/BackLink";
import { getServerDictionary } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/users";
import { Building2, Users } from "lucide-react";
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
    <div className="mx-auto mt-4 flex w-full max-w-3xl flex-col gap-6 px-4">
      <BackLink href={`/org/${organizationSlug}/admin`} />
      <header className="flex items-center gap-3">
        <Building2 className="h-8 w-8 text-brand" aria-hidden="true" />
        <h1 className="text-3xl font-bold uppercase">{t.admin.organizationsTitle}</h1>
      </header>

      <section className="flex flex-col gap-4 rounded-xl bg-muted p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{organization.name}</h2>
            <p className="text-sm text-muted-foreground">/{organization.slug}</p>
          </div>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-4 w-4" aria-hidden="true" />
            {t.admin.organizationsMemberCount.replace(
              "{count}",
              String(organization._count.persons),
            )}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{t.admin.organizationsPageDescription}</p>
      </section>
    </div>
  );
}
