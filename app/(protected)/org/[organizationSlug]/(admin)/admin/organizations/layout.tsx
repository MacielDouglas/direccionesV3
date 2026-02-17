import RoleGuard from "@/components/RoleGuard";

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard minRole="owner">{children}</RoleGuard>;
}
