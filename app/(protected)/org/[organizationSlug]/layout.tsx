import { setActiveOrg } from "@/server/organization/organization.actions";
import { TenantProvider } from "@/providers/TenantProvider";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { getCurrentUser } from "@/server/users";
import { notFound, redirect } from "next/navigation";
import { SetActiveOrg } from "@/components/SetActiveOrg";

type Props = {
  children: React.ReactNode;
  params: Promise<{ organizationSlug: string }>;
};

export default async function TenantLayout({ children, params }: Props) {
  const { organizationSlug } = await params;

  const data = await getCurrentUser();
  if (!data) redirect("/login");

  const organization = await getOrganizationBySlug(organizationSlug);
  if (!organization) notFound();

  // Verifica se o usuário é membro desta org
  if (!data.activeMember) redirect("/organizations");

 if (data.activeMember?.organizationId !== organization.id) {
  await setActiveOrg(organization.id)
  }

  const needsOrgSwitch =
  data.activeMember?.organizationId !== organization.id;

if (needsOrgSwitch) {
  await setActiveOrg(organization.id);
}

  const role = data.memberRole?.role ?? null;

  return (
    <TenantProvider
      value={{
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
        },
        membership: { role },
      }}
    >
       {needsOrgSwitch && (
      <SetActiveOrg organizationId={organization.id} />
    )}
      {children}
    </TenantProvider>
  );
}
