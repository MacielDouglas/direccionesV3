import { canAccess } from "@/lib/autorize";
import { getCurrentUser } from "@/server/users";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

type CanAccessRole = Parameters<typeof canAccess>[0];

interface RoleGuardProps {
  minRole: CanAccessRole;
  children: ReactNode;
}

export default async function RoleGuard({ minRole, children }: RoleGuardProps) {
  const data = await getCurrentUser();
  const role = data?.memberRole?.role as CanAccessRole | undefined;

  if (!role || !canAccess(role, minRole)) {
    redirect("/");
  }

  return <>{children}</>;
}
