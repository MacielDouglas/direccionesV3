import RoleGuard from "@/components/RoleGuard";
import { getCurrentUser } from "@/server/users";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getCurrentUser(); // cacheado — sem query extra
  const role = data?.memberRole?.role ?? null;

  return (
    <RoleGuard minRole="admin" role={role}>
      {children}
    </RoleGuard>
  );
}
