import { BackLink } from "@/components/ui/BackLink";
import { canManageCards } from "@/features/cards/permissions/canManageCards";
import { CardListScreen } from "@/features/cards/ui/components/CardListScreen";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { requireSession } from "@/server/users";
import { redirect } from "next/navigation";

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
    <>
      <div className="mx-auto w-full max-w-5xl px-4 pt-4">
        <BackLink href={`/org/${organizationSlug}/admin`} />
      </div>
      <CardListScreen organizationId={org.id} organizationSlug={organizationSlug} />
    </>
  );
}
