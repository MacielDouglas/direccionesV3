import { getCurrentUser } from "@/server/users";
import { getOrganizations } from "@/server/organization/organization.queries";
import { setActiveOrg } from "@/server/organization/organization.actions";
import { redirect } from "next/navigation";
import { OrgSwitchButton } from "@/domains/organization/components/OrgSwitchButtom";

export default async function OrganizationsPage() {
  const data = await getCurrentUser();
  if (!data) redirect("/login");

  const organizations = await getOrganizations();

  return (
    <main className="mx-auto max-w-md px-4 py-10 text-center">
      <h1 className="text-2xl font-semibold">Selecciona una organización</h1>
      <p className="mt-2 text-muted-foreground">
        Elige con cuál organización deseas continuar.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {organizations.map((org) => (
          <form
            key={org.id}
            action={async () => {
              "use server";
              await setActiveOrg(org.id);
              redirect(`/org/${org.slug}/addresses`);
            }}
          >
            <OrgSwitchButton name={org.name} />
          </form>
        ))}
      </div>
    </main>
  );
}
