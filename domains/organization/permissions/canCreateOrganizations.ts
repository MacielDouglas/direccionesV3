import { Role } from "@/domains/member/types/role.types";

export function canCreateOrganization(role: Role) {
  return role === "owner";
}
