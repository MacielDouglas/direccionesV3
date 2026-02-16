import { canCreateOrganization } from "../permissions/canCreateOrganizations";
import { createOrganizationSchema } from "../schemas/organization.schema";
import { Role } from "@/domains/member/types/role.types";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function createOrganizationService(
  input: unknown,
  context: {
    userId: string;
    role: Role;
  },
) {
  const data = createOrganizationSchema.parse(input);

  if (!canCreateOrganization(context.role))
    throw new Error("Não tem autorização para criar uma organização.");

  const result = await auth.api.createOrganization({
    body: {
      name: data.name,
      slug: data.slug,
    },
    headers: await headers(),
  });

  revalidatePath("/security/organizations");

  return result;
}
