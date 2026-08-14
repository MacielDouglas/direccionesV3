import { BackLink } from "@/components/ui/BackLink";
import { InvitationsScreen } from "@/features/invitations/ui/screens/InvitationsScreen";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { getCurrentUser } from "@/server/users";
import { redirect } from "next/navigation";

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
  if (!userData.isSuperUser && (!role || !["admin", "owner"].includes(role))) {
    redirect(`/org/${organizationSlug}`);
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="px-4 pt-4">
        <BackLink href={`/org/${organizationSlug}/admin`} />
      </div>
      <InvitationsScreen organizationId={org.id} orgSlug={organizationSlug} />
    </div>
  );
}
