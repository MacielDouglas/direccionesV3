import { getPendingDeletionAddresses } from "@/features/addresses/application/address.service";
import PendingDeletionScreen from "@/features/addresses/ui/screens/PendingDeletionScreen";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ organizationSlug: string }> };

export default async function PendingDeletionPage({ params }: Props) {
  const { organizationSlug } = await params;

  const org = await getOrganizationBySlug(organizationSlug);
  if (!org) notFound();

  const addresses = await getPendingDeletionAddresses(org.id);

  return <PendingDeletionScreen addresses={addresses} organizationSlug={organizationSlug} />;
}
