"use server";

import { createOrganizationService } from "@/domains/organization";
import { getSession } from "@/infrastructure/auth/session";

export async function createOrganizationAction(data: {
  name: string;
  slug: string;
}) {
  const session = await getSession();
  if (!session) throw new Error("SEM Autorização.");

  return await createOrganizationService(data, {
    userId: session.user.id,
    role: session.user.role,
  });
}
