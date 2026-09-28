import { canAccess } from "@/lib/autorize";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { getCurrentUser } from "@/server/users";
import { notFound, redirect } from "next/navigation";

export default async function MemberLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ organizationSlug: string }>;
}) {
  const { organizationSlug } = await params;
  const data = await getCurrentUser(); // cacheado — sem custo
  const role = data?.isSuperUser ? "superuser" : (data?.memberRole?.role ?? null);

  if (!role || !canAccess(role as "member", "member")) redirect("/");

  // A org da URL precisa existir e ser a org ativa do usuário —
  // impede enumeração de slugs de outras organizações.
  const org = await getOrganizationBySlug(organizationSlug);
  if (!org) notFound();
  if (!data?.isSuperUser && data?.person.organizationId !== org.id) redirect("/");

  return <>{children}</>;
}
