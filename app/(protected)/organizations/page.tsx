import { getServerDictionary } from "@/lib/i18n/server";
import { getOrganizations } from "@/server/organization/organization.queries";
import { getCurrentUser } from "@/server/users";
import { Building2, ChevronRight, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  return { title: t.admin.organizationsTitle };
}

export default async function OrganizationsPage() {
  const [data, t] = await Promise.all([getCurrentUser(), getServerDictionary()]);
  if (!data) redirect("/login");
  if (!data.isSuperUser) redirect("/");

  const organizations = await getOrganizations();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <header className="flex flex-col items-center gap-2 text-center">
        <Building2 className="h-10 w-10 text-brand" aria-hidden="true" />
        <h1 className="text-2xl font-semibold tracking-tight">{t.admin.organizationsTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.admin.organizationsPageDescription}</p>
      </header>

      <div className="mt-8 flex flex-col gap-3">
        {organizations.length > 0 ? (
          organizations.map((org) => (
            <Link
              key={org.id}
              href={`/org/${org.slug}`}
              className="group flex min-h-16 items-center justify-between gap-4 rounded-2xl border bg-card p-4 shadow-xs transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{org.name}</p>
                <p className="truncate text-sm text-muted-foreground">/{org.slug}</p>
              </div>
              <span className="flex shrink-0 items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" aria-hidden="true" />
                  {org._count.persons}
                </span>
                <ChevronRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card px-4 py-10 text-center">
            <Building2 className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">{t.admin.noOrganizations}</p>
          </div>
        )}
      </div>
    </main>
  );
}
