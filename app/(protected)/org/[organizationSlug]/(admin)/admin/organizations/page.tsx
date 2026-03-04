import { getOrganizations } from "@/server/organization/organization.queries";
import OrganizationForm from "@/domains/organization/components/OrganizationForm";
import { Building2 } from "lucide-react";
import { setActiveOrg } from "@/server/organization/organization.actions";
import { redirect } from "next/navigation";
import { OrgSwitchButton } from "@/domains/organization/components/OrgSwitchButtom";

export default async function OrganizationsPage() {
  const organizations = await getOrganizations();

  return (
    <div className="mx-auto mt-4 flex w-full max-w-6xl flex-col gap-6 px-4">
      <header className="flex items-center gap-3">
        <Building2 className="h-8 w-8 text-brand" aria-hidden="true" />
        <h1 className="text-3xl font-bold uppercase">Organizaciones</h1>
      </header>

      <OrganizationForm />

      <section className="flex flex-col gap-4 rounded-xl bg-muted p-5">
        <div>
          <h2 className="text-xl font-semibold">
            Organizaciones creadas:{" "}
            <span className="text-brand">{organizations.length}</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Selecciona una organización para gestionar sus usuarios.
          </p>
        </div>

        {organizations.length > 0 ? (
          <div className="flex flex-wrap gap-3">
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
        ) : (
          <p className="text-sm text-muted-foreground">
            Aún no hay organizaciones. Crea una con el formulario de arriba.
          </p>
        )}
      </section>
    </div>
  );
}
