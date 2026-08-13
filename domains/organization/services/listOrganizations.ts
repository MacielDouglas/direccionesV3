import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/users";

export async function listOrganizationsService() {
  const data = await getCurrentUser();
  if (!data?.isSuperUser) throw new Error("No autorizado.");

  return prisma.organization.findMany({
    orderBy: { createdAt: "asc" },
  });
}
