import { canManageCards } from "@/features/cards/permissions/canManageCards";
import { CardCreateScreen } from "@/features/cards/ui/screens/CardCreateScreen";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { requireSession } from "@/server/users";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ organizationSlug: string }>;
}

export default async function CardNewPage({ params }: Props) {
  const { organizationSlug } = await params;

  const [session, org] = await Promise.all([
    requireSession(),
    getOrganizationBySlug(organizationSlug),
  ]);

  if (!org) redirect("/organizations");

  const canCreate = await canManageCards(session.user.id, org.id);
  if (!canCreate) redirect(`/org/${organizationSlug}`);

  return (
    <CardCreateScreen
      organizationId={org.id}
      organizationSlug={organizationSlug}
    />
  );
}
