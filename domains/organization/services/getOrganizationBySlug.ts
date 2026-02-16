import { prisma } from "@/lib/prisma";

export async function getOrganizationBySlugService(slug: string) {
  if (!slug) {
    throw new Error("Slug is required");
  }

  return prisma.organization.findUnique({
    where: { slug },
    include: {
      members: {
        include: { user: true },
      },
    },
  });
}
