import RoleGuard from "@/components/RoleGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard minRole="admin">
      <main id="main-content">{children}</main>
    </RoleGuard>
  );
}
