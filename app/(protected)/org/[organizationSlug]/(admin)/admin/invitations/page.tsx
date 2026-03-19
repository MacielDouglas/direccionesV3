import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/users";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { InvitationsScreen } from "@/features/invitations/ui/screens/InvitationsScreen";

interface Props {
  params: Promise<{ organizationSlug: string }>;
}

export default async function InvitationsPage({ params }: Props) {
  const { organizationSlug } = await params;

  const [userData, org] = await Promise.all([
    getCurrentUser(),
    getOrganizationBySlug(organizationSlug),
  ]);

  if (!userData) redirect("/login");
  if (!org) redirect("/organizations");

  const role = userData.memberRole?.role;
  if (!role || !["admin", "owner"].includes(role)) {
    redirect(`/org/${organizationSlug}`);
  }

  return (
    <InvitationsScreen organizationId={org.id} orgSlug={organizationSlug} />
  );
}
