import RoleGuard from "@/components/RoleGuard";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { getCurrentUser, requireOrgAdminOrOwner } from "@/server/users";
import { notFound, redirect } from "next/navigation";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ organizationSlug: string }>;
}) {
  const { organizationSlug } = await params;
  const data = await getCurrentUser(); // cacheado — sem query extra
  const role = data?.isSuperUser ? "superuser" : (data?.memberRole?.role ?? null);

  // Permissão validada na org da URL (não só na org ativa) —
  // admin da org A não abre /org/B/admin/... trocando o slug.
  const org = await getOrganizationBySlug(organizationSlug);
  if (!org) notFound();
  try {
    await requireOrgAdminOrOwner(org.id);
  } catch {
    redirect(`/org/${organizationSlug}`);
  }

  return (
    <RoleGuard minRole="admin" role={role}>
      {children}
    </RoleGuard>
  );
}
