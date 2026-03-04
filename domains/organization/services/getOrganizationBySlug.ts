import { prisma } from "@/lib/prisma";

export async function getOrganizationBySlugService(slug: string) {
  if (!slug) throw new Error("El slug es requerido.");

  return prisma.organization.findUnique({
    where: { slug },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
    },
  });
}
