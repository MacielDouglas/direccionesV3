import { TenantProvider } from "@/providers/TenantProvider";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { getCurrentUser } from "@/server/users";
import { mapAuthRole } from "@/infrastructure/auth/mapRole";
import { notFound, redirect } from "next/navigation";

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

  // Se a org da URL é diferente da ativa → troca automaticamente
  if (data.activeMember.organizationId !== organization.id) {
    const { setActiveOrg } =
      await import("@/server/organization/organization.actions");
    await setActiveOrg(organization.id);
    // Não redireciona — continua renderizando com a nova org ativa
  }

  const role = data.memberRole?.role ? mapAuthRole(data.memberRole.role) : null;

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
      {children}
    </TenantProvider>
  );
}
