import RoleGuard from "@/components/RoleGuard";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard minRole="member">{children}</RoleGuard>;
}
