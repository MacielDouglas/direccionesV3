import { canAccess } from "@/lib/autorize";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

type CanAccessRole = Parameters<typeof canAccess>[0];

interface RoleGuardProps {
  minRole: CanAccessRole;
  role: CanAccessRole | null | undefined;
  children: ReactNode;
}

export default function RoleGuard({ minRole, role, children }: RoleGuardProps) {
  if (!role || !canAccess(role, minRole)) redirect("/");
  return <>{children}</>;
}
