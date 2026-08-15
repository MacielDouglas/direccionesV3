import { HomeDashboard } from "@/features/home/ui/HomeDashboard";
import { getServerDictionary } from "@/lib/i18n/server";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { getCurrentUser } from "@/server/users";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  return { title: t.common.home };
}

interface Props {
  params: Promise<{ organizationSlug: string }>;
}

export default async function OrgHomePage({ params }: Props) {
  const { organizationSlug } = await params;

  const [data, organization] = await Promise.all([
    getCurrentUser(),
    getOrganizationBySlug(organizationSlug),
  ]);
  if (!data) redirect("/login");
  if (!organization) notFound();

  if (!data.isSuperUser) {
    if (!data.person.organizationId) redirect("/");
    if (data.person.organizationId !== organization.id) redirect("/");
  }

  const role = data.memberRole?.role ?? null;
  const isAdminOrOwner = data.isSuperUser || ["admin", "owner"].includes(role ?? "");

  return (
    <HomeDashboard
      organizationId={organization.id}
      organizationSlug={organization.slug}
      personId={data.person.id}
      userName={data.person.name}
      isAdminOrOwner={isAdminOrOwner}
    />
  );
}
