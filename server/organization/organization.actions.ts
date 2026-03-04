"use server";

import { createOrganizationService } from "@/domains/organization";
import { getSession } from "@/infrastructure/auth/session";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createOrganizationAction(data: {
  name: string;
  slug: string;
}) {
  const session = await getSession();
  if (!session) throw new Error("No autorizado.");

  return createOrganizationService(data, {
    userId: session.user.id,
    role: session.user.role,
  });
}

// server/organization/organization.actions.ts
export const setActiveOrg = async (organizationId: string) => {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) throw new Error("No autenticado.");

  await auth.api.setActiveOrganization({
    body: { organizationId },
    headers: reqHeaders,
  });
};
