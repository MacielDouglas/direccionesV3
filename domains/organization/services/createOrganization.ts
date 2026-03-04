import { canCreateOrganization } from "../permissions/canCreateOrganizations";
import type { CreateOrganizationInput } from "../schemas/organization.schema";
import { createOrganizationSchema } from "../schemas/organization.schema";
import type { Role } from "@/domains/member/types/role.types";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

interface CreateOrganizationContext {
  userId: string;
  role: Role | null;
}

export async function createOrganizationService(
  input: unknown,
  context: CreateOrganizationContext,
) {
  if (!context.role) {
    throw new Error("El usuario no pertenece a ninguna organización activa.");
  }

  if (!canCreateOrganization(context.role)) {
    throw new Error("No tiene autorización para crear una organización.");
  }

  const data: CreateOrganizationInput = createOrganizationSchema.parse(input);

  const result = await auth.api.createOrganization({
    body: { name: data.name, slug: data.slug },
    headers: await headers(),
  });

  revalidatePath("/admin/organizations");

  return result;
}
