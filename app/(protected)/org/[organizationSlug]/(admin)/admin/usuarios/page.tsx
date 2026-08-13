import { BackLink } from "@/components/ui/BackLink";
import { UsersScreen } from "@/features/people/ui/screens/UsersScreen";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { getOrgUsersWithPersons } from "@/server/person";
import { getCurrentUser } from "@/server/users";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Usuários" };

interface Props {
  params: Promise<{ organizationSlug: string }>;
}

export default async function UsersPage({ params }: Props) {
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

  const { usersWithPerson, usersWithoutPerson } = await getOrgUsersWithPersons(organization.id);

  return (
    <main className="mx-auto w-full max-w-3xl">
      <div className="px-4 pt-4">
        <BackLink href={`/org/${organizationSlug}/admin`} />
      </div>
      <UsersScreen
        usersWithPerson={usersWithPerson}
        usersWithoutPerson={usersWithoutPerson}
        organizationId={organization.id}
        organizationSlug={organizationSlug}
        currentRole={data.isSuperUser ? "owner" : (data.memberRole?.role ?? null)}
        isSuperUser={data.isSuperUser}
        currentUserId={data.user.id}
      />
    </main>
  );
}
