import { OfflineSyncProvider } from "@/features/pwa/core/offline-sync";
import { TenantProvider } from "@/providers/TenantProvider";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { getCurrentUser } from "@/server/users";
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

  const isSuperUser = data.isSuperUser;

  if (!isSuperUser) {
    if (!data.person?.organizationId) redirect("/");

    if (data.person.organizationId !== organization.id) {
      notFound();
    }
  }

  const role = isSuperUser ? "superuser" : (data.memberRole?.role ?? null);

  const content = (
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

  // Super User não tem organização ativa no layout protegido: sincroniza
  // o contexto offline da organização visitada.
  if (!isSuperUser || !data.person) return content;

  return (
    <OfflineSyncProvider organizationId={organization.id} personId={data.person.id}>
      {content}
    </OfflineSyncProvider>
  );
}
