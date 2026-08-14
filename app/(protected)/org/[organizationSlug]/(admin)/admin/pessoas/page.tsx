// app/(protected)/org/[organizationSlug]/(admin)/admin/pessoas/page.tsx
import { BackLink } from "@/components/ui/BackLink";
import { PeopleScreen } from "@/features/people/ui/screens/PeopleScreen";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { getOrgPersonsWithInvites } from "@/server/person";
import { getCurrentUser } from "@/server/users";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Pessoas" };

interface Props {
  params: Promise<{ organizationSlug: string }>;
}

export default async function PeoplePage({ params }: Props) {
  const { organizationSlug } = await params;

  const [organization, data] = await Promise.all([
    getOrganizationBySlug(organizationSlug),
    getCurrentUser(),
  ]);
  if (!organization) redirect("/organizations");
  if (!data) redirect("/login");

  const role = data.memberRole?.role;
  if (!data.isSuperUser && (!role || !["admin", "owner"].includes(role))) {
    redirect(`/org/${organizationSlug}`);
  }

  const persons = await getOrgPersonsWithInvites(organization.id);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackLink href={`/org/${organizationSlug}/admin`} />
      </div>
      <PeopleScreen
        persons={persons}
        organizationId={organization.id}
        organizationSlug={organizationSlug}
        currentRole={data.isSuperUser ? "owner" : (data.memberRole?.role ?? null)}
        isSuperUser={data.isSuperUser}
        currentUserId={data.user.id}
      />
    </main>
  );
}
