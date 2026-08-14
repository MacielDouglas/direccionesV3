import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/users";
import { Building2, Users } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Organizaciones",
};

export default async function OrganizationsPage() {
  const data = await getCurrentUser();
  if (!data) redirect("/login");
  if (!data.isSuperUser) redirect("/");

  const organizations = await prisma.organization.findMany({
    include: { _count: { select: { persons: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <header className="flex flex-col items-center gap-2 text-center">
        <Building2 className="h-10 w-10 text-brand" aria-hidden="true" />
        <h1 className="text-2xl font-semibold">Organizaciones</h1>
        <p className="text-sm text-muted-foreground">Lista de organizaciones registradas.</p>
      </header>

      <div className="mt-8 flex flex-col gap-3">
        {organizations.length > 0 ? (
          organizations.map((org) => (
            <div
              key={org.id}
              className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-4 shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{org.name}</p>
                <p className="truncate text-sm text-muted-foreground">/{org.slug}</p>
              </div>
              <span className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="h-4 w-4" aria-hidden="true" />
                {org._count.persons}
              </span>
            </div>
          ))
        ) : (
          <p className="text-center text-sm text-muted-foreground">Aún no hay organizaciones.</p>
        )}
      </div>
    </main>
  );
}
