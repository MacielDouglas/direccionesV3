import { ROLES, type Role } from "../types/role.types";

export function toRole(value: string | null | undefined): Role | null {
  if (!value) return null;
  return (ROLES as readonly string[]).includes(value) ? (value as Role) : null;
}
