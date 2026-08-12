export const roleRank = {
  member: 1,
  admin: 2,
  owner: 3,
  superuser: 10,
} as const;

export type AppRole = keyof typeof roleRank;

export function canAccess(userRole: AppRole, required: AppRole): boolean {
  return roleRank[userRole] >= roleRank[required];
}
