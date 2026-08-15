import { BackLink } from "@/components/ui/BackLink";
import { getOrgInviteTokensAction } from "@/features/invitations/applications/inviteToken.action";
import { AdminGestaoScreen } from "@/features/people/ui/screens/AdminGestaoScreen";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { getOrgPersonsWithInvites } from "@/server/person";
import { getCurrentUser } from "@/server/users";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Gestão",
};

interface Props {
  params: Promise<{ organizationSlug: string }>;
}

export default async function GestaoPage({ params }: Props) {
  const { organizationSlug } = await params;

  const [data, organization] = await Promise.all([
    getCurrentUser(),
    getOrganizationBySlug(organizationSlug),
  ]);

  if (!data) redirect("/login");
  if (!organization) notFound();

  const role = data.memberRole?.role;
  if (!data.isSuperUser && (!role || !["admin", "owner"].includes(role))) {
    redirect(`/org/${organizationSlug}`);
  }

  const [persons, tokens] = await Promise.all([
    getOrgPersonsWithInvites(organization.id),
    getOrgInviteTokensAction(organization.id),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl">
      <div className="px-4 pt-4">
        <BackLink href={`/org/${organizationSlug}/admin`} />
      </div>
      <AdminGestaoScreen
        persons={persons}
        tokens={tokens.map((token) => ({
          id: token.id,
          token: token.token,
          usedAt: token.usedAt?.toISOString() ?? null,
          expiresAt: token.expiresAt.toISOString(),
          createdAt: token.createdAt.toISOString(),
          createdByName: token.createdBy.name,
          personName: token.person?.name ?? null,
          usedByName: token.usedBy?.name ?? null,
        }))}
        organizationId={organization.id}
        organizationSlug={organizationSlug}
        organizationName={organization.name}
        currentRole={data.isSuperUser ? "owner" : (role ?? null)}
        isSuperUser={data.isSuperUser}
        currentUserId={data.user.id}
      />
    </main>
  );
}
