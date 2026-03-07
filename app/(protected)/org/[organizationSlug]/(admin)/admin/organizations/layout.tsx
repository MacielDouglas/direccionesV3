import RoleGuard from "@/components/RoleGuard";

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard minRole="owner">
      <main id="main-content">{children}</main>
    </RoleGuard>
  );
}
