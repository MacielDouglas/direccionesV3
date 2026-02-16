import { getUsers } from "@/server/users";
import MembersTable from "../../users/tables/MembersTable";
import AllUsers from "../../users/tables/AllUsers";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { notFound } from "next/navigation";

export default async function Organization({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const organization = await getOrganizationBySlug(slug);

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
            slug={slug}
            organizationId={organization?.id || ""}
          />
        </section>
      </div>
    </main>
  );
}
