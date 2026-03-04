// app/(protected)/organizations/page.tsx
import { getCurrentUser } from "@/server/users";
import { getOrganizations } from "@/server/organization/organization.queries";
import { setActiveOrg } from "@/server/organization/organization.actions";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

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
            <Button
              type="submit"
              variant="outline"
              className="w-full justify-start gap-3"
            >
              <Building2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              {org.name}
            </Button>
          </form>
        ))}
      </div>
    </main>
  );
}
