import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { getNonMemberUsers } from "@/server/users";
import { notFound } from "next/navigation";
import AllUsers from "./tables/AllUsers";
import MembersTable from "./tables/MembersTable";

type Props = {
  params: Promise<{ organizationSlug: string }>;
};

export default async function UsersPage({ params }: Props) {
  const { organizationSlug } = await params;

  const organization = await getOrganizationBySlug(organizationSlug);
  if (!organization) notFound();

  const nonMembers = await getNonMemberUsers(organization.id);

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6">
      <header>
        <h1 className="text-3xl font-semibold">{organization.name} — Usuarios</h1>
      </header>

      <section>
        <MembersTable members={organization.members} />
      </section>

      <section>
        <AllUsers users={nonMembers} slug={organizationSlug} organizationId={organization.id} />
      </section>
    </main>
  );
}
