// app/(protected)/admin/layout.tsx
import RoleGuard from "@/components/RoleGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard minRole="admin">{children}</RoleGuard>;
}

// import { hasAccess } from "@/lib/autorize";
// import { getCurrentUser } from "@/server/users";
// import { redirect } from "next/navigation";
// // import { getCurrentUser } from "@/server/get-current-user";
// // import { canAccess } from "@/lib/authorize";

// export default async function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const data = await getCurrentUser();

//   if (!data || !hasAccess(data.memberRole?.role ?? "null", "admin")) {
//     redirect("/");
//   }

//   return children;
// }
