import type { Role as DomainRole } from "@/domains/member/types/role.types";

export function mapAuthRole(role: string): DomainRole {
  switch (role) {
    case "owner":
    case "admin":
    case "member":
      return role;

    default:
      throw new Error("Invalid role");
  }
}
