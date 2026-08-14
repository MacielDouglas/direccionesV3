import { PendingDeletionList } from "@/features/addresses/ui/components/PendingDeletionList";
import { getServerDictionary } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { getCurrentUser } from "@/server/users";
import { notFound, redirect } from "next/navigation";

type Props = { params: Promise<{ organizationSlug: string }> };

export default async function PendingDeletionPage({ params }: Props) {
  const { organizationSlug } = await params;

  const data = await getCurrentUser();
  if (!data) redirect("/login");

  const role = data.memberRole?.role;
  if (!data.isSuperUser && (!role || !["admin", "owner"].includes(role))) redirect("/");

  const organization = await getOrganizationBySlug(organizationSlug);
  if (!organization) notFound();

  const addresses = await prisma.address.findMany({
    where: { organizationId: organization.id, pendingDeletion: true },
    include: {
      requestedBy: { select: { name: true, user: { select: { email: true } } } },
    },
    orderBy: { pendingDeletionAt: "asc" },
  });

  const t = await getServerDictionary();

  const countLabel =
    addresses.length === 1
      ? t.addresses.pendingDeletionCountOne
      : t.addresses.pendingDeletionCountMany.replace("{count}", String(addresses.length));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <h1 className="text-2xl font-semibold">{t.addresses.deletionRequestsTitle}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{countLabel}</p>
      <PendingDeletionList addresses={addresses} orgSlug={organizationSlug} />
    </main>
  );
}
