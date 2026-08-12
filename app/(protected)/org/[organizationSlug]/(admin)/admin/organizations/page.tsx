import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/users";
import { Building2, Users } from "lucide-react";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ organizationSlug: string }>;
}

export default async function OrganizationsPage({ params }: Props) {
  const { organizationSlug } = await params;
  const data = await getCurrentUser();
  if (!data) redirect("/login");

  const organization = await prisma.organization.findUnique({
    where: { slug: organizationSlug },
    include: { _count: { select: { members: true } } },
  });

  if (!organization) redirect("/");

  return (
    <div className="mx-auto mt-4 flex w-full max-w-6xl flex-col gap-6 px-4">
      <header className="flex items-center gap-3">
        <Building2 className="h-8 w-8 text-brand" aria-hidden="true" />
        <h1 className="text-3xl font-bold uppercase">Organizaciones</h1>
      </header>

      <section className="flex flex-col gap-4 rounded-xl bg-muted p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{organization.name}</h2>
            <p className="text-sm text-muted-foreground">/{organization.slug}</p>
          </div>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-4 w-4" aria-hidden="true" />
            {organization._count.members} miembros
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Cada usuario pertenece a una única organización. Gestiona los miembros desde la sección de
          usuarios.
        </p>
      </section>
    </div>
  );
}
