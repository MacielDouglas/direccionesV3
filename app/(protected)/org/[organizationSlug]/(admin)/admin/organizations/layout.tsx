import RoleGuard from "@/components/RoleGuard";
import { getCurrentUser } from "@/server/users";

export default async function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getCurrentUser();
  const role = data?.memberRole?.role ?? null;

  return (
    <RoleGuard minRole="admin" role={role}>
      <main id="main-content">{children}</main>
    </RoleGuard>
  );
}
