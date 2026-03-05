import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/users";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { notFound, redirect } from "next/navigation";
import { PendingDeletionList } from "@/features/addresses/ui/components/PendingDeletionList";
// import { PendingDeletionList } from "@/features/addresses/ui/components/PendingDeletionList";

type Props = { params: Promise<{ organizationSlug: string }> };

export default async function PendingDeletionPage({ params }: Props) {
  const { organizationSlug } = await params;

  const data = await getCurrentUser();
  if (!data) redirect("/login");

  const role = data.memberRole?.role;
  if (!role || !["admin", "owner"].includes(role)) redirect("/");

  const organization = await getOrganizationBySlug(organizationSlug);
  if (!organization) notFound();

  const addresses = await prisma.address.findMany({
    where: { organizationId: organization.id, pendingDeletion: true },
    include: { requestedBy: { select: { name: true, email: true } } },
    orderBy: { pendingDeletionAt: "asc" },
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <h1 className="text-2xl font-semibold">Solicitudes de eliminación</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {addresses.length} dirección{addresses.length !== 1 ? "es" : ""}{" "}
        pendiente{addresses.length !== 1 ? "s" : ""}
      </p>
      <PendingDeletionList addresses={addresses} orgSlug={organizationSlug} />
    </main>
  );
}
