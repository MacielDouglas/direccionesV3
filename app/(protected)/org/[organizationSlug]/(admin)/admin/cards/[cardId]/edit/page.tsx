import { redirect } from "next/navigation";

import { BackLink } from "@/components/ui/BackLink";
import { canManageCards } from "@/features/cards/permissions/canManageCards";
import { CardEditScreen } from "@/features/cards/ui/screens/CardEditScreen";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { requireSession } from "@/server/users";

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
    <div className="mx-auto w-full max-w-3xl">
      <div className="px-4 pt-4">
        <BackLink href={`/org/${organizationSlug}/admin/cards`} />
      </div>
      <CardEditScreen cardId={cardId} organizationId={org.id} organizationSlug={organizationSlug} />
    </div>
  );
}
