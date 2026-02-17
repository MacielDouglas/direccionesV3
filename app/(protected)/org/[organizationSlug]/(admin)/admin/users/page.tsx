import { getUsers } from "@/server/users";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { notFound } from "next/navigation";
import MembersTable from "./tables/MembersTable";
import AllUsers from "./tables/AllUsers";

type Props = {
  params: {
    organizationSlug: string;
  };
};

export default async function Organization({ params }: Props) {
  const { organizationSlug } = await params;

  const organization = await getOrganizationBySlug(organizationSlug);

  if (!organization) notFound();

  const users = await getUsers(organization.id);

  return (
    <main className="w-full max-w-3xl mx-auto px-4 py-6 space-y-8">
      <div className="">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-semibold">
            {organization?.name} - Usuários
          </h1>
        </header>

        {/* Members */}
        <section>
          <MembersTable members={organization?.members || []} />
        </section>

        {/* All users */}
        <section>
          <AllUsers
            users={users}
            slug={organizationSlug}
            organizationId={organization?.id || ""}
          />
        </section>
      </div>
    </main>
  );
}
