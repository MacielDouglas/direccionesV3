import { redirect } from "next/navigation";
import { canManageCards } from "@/features/cards/permissions/canManageCards";
import { requireSession } from "@/server/users";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { CardListScreen } from "@/features/cards/ui/components/CardListScreen";

interface Props {
  params: Promise<{ organizationSlug: string }>;
}

export default async function CardsPage({ params }: Props) {
  const { organizationSlug } = await params;
  const [session, org] = await Promise.all([
    requireSession(),
    getOrganizationBySlug(organizationSlug),
  ]);

  if (!org) redirect("/organizations");

  const canManage = await canManageCards(session.user.id, org.id);
  if (!canManage) redirect(`/org/${organizationSlug}`);

  return (
    <CardListScreen
      organizationId={org.id}
      organizationSlug={organizationSlug}
    />
  );
}
