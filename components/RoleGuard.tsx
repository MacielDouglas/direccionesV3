import { canAccess } from "@/lib/autorize";
import { getCurrentUser } from "@/server/users";
import { redirect } from "next/navigation";

type CanAccessRole = Parameters<typeof canAccess>[0];

export default async function RoleGuard({
  minRole,
  children,
}: {
  minRole: CanAccessRole;
  children: React.ReactNode;
}) {
  const data = await getCurrentUser();

  const role = data?.memberRole?.role as CanAccessRole | undefined;
  if (!role || !canAccess(role, minRole)) {
    redirect("/");
  }

  return children;
}
