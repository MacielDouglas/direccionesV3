import { getOrganizationBySlug } from "@/server/organizations";
import { getUsers } from "@/server/users";
import MembersTable from "../tables/MembersTable";
import AllUsers from "../tables/AllUsers";

type Params = Promise<{ slug: string }>;

export default async function Organization({ params }: { params: Params }) {
  const { slug } = await params;
  const organization = await getOrganizationBySlug(slug);
  const users = await getUsers(organization?.id || "");

  return (
    <main className="w-full max-w-3xl mx-auto px-4 py-6 space-y-8 bg-slate-50">
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
          <AllUsers users={users} organizationId={organization?.id || ""} />
        </section>
      </div>
    </main>
  );
}
