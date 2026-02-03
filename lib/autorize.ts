export const roleRank = {
  member: 1,
  admin: 2,
  owner: 3,
} as const;

export function canAccess(
  userRole: keyof typeof roleRank,
  required: keyof typeof roleRank,
) {
  return roleRank[userRole] >= roleRank[required];
}
