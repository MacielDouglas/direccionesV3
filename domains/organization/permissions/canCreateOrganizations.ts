import type { Role } from "@/domains/member/types/role.types";

export function canCreateOrganization(role: Role): boolean {
  return role === "owner";
}
