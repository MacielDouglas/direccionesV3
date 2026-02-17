import { TenantProvider } from "@/providers/TenantProvider";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { getCurrentUser } from "@/server/users";
import { notFound, redirect } from "next/navigation";

type Props = {
  children: React.ReactNode;
  params: Promise<{
    organizationSlug: string;
  }>;
};

export default async function TenantLayout({ children, params }: Props) {
  const { organizationSlug } = await params;
  const data = await getCurrentUser();

  if (!data) redirect("/login");

  if (!organizationSlug) redirect("/organizations");

  const organization = await getOrganizationBySlug(organizationSlug);

  if (!organization) notFound();

  if (
    !data.activeMember ||
    data.activeMember.organizationId !== organization.id
  )
    redirect("/organization");

  return (
    <TenantProvider
      value={{
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
        },
        membership: {
          role: data.memberRole?.role ?? null,
        },
      }}
    >
      {children}
    </TenantProvider>
  );
}
