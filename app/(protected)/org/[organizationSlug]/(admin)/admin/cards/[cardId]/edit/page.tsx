import { redirect } from "next/navigation";

import { canManageCards } from "@/features/cards/permissions/canManageCards";
import { CardEditScreen } from "@/features/cards/ui/screens/CardEditScreen";
import { requireSession } from "@/server/users";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";

interface Props {
  params: Promise<{ organizationSlug: string; cardId: string }>;
}

export default async function CardEditPage({ params }: Props) {
  const { organizationSlug, cardId } = await params;

  const [session, org] = await Promise.all([
    requireSession(),
    getOrganizationBySlug(organizationSlug),
  ]);

  if (!org) redirect("/organizations");

  const canManage = await canManageCards(session.user.id, org.id);
  if (!canManage) redirect(`/org/${organizationSlug}`);

  return (
    <div className="w-full max-w-3xl mx-auto py-2">
      <CardEditScreen
        cardId={cardId}
        organizationId={org.id}
        organizationSlug={organizationSlug}
      />
    </div>
  );
}
