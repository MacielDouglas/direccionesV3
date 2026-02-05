import { getOrganizations } from "@/server/organizations";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import OrganizationForm from "./components/OrganizationForm";

// type Params = Promise<{ slug: string }>;

export default async function Organization() {
  const organizations = await getOrganizations();

  return (
    <div className="min-h-dvh flex flex-col gap-6 px-4 w-full max-w-6xl mx-auto mt-4">
      <h1 className="font-bold uppercase text-3xl">
        Minhas Organizações (owner)
      </h1>
      <OrganizationForm />
      <div className="flex flex-col gap-2 bg-slate-300 p-5 rounded-xl">
        <h2 className="font-semibold text-xl">
          Organizações criadas: {organizations.length}
        </h2>

        <div className="p-5 space-y-3 ">
          <h2>Escolha uma organização:</h2>
          <div className="flex flex-wrap gap-3">
            {organizations.map((org) => (
              <Button type="button" className="btn " key={org.id}>
                <Link href={`/admin/users/${org.slug}`}>{org.name}</Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
