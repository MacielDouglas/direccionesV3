import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { createOrganizationByNameSchema } from "../schemas/organization.schema";
import { createSlug } from "../utils/createSlug";

const createOrganizationInputSchema = createOrganizationByNameSchema.extend({
  token: z.string().min(1, "Se requiere un token de acceso."),
});

interface CreateOrganizationContext {
  userId: string;
}

export async function createOrganizationService(
  input: unknown,
  context: CreateOrganizationContext,
) {
  const data = createOrganizationInputSchema.parse(input);
  const slug = createSlug(data.name);

  const invite = await prisma.inviteToken.findUnique({
    where: { token: data.token },
  });

  if (!invite || invite.type !== "OWNER_ONBOARDING") {
    throw new Error("Token no válido.");
  }
  if (invite.usedAt) {
    throw new Error("Este token ya fue utilizado.");
  }
  if (invite.expiresAt < new Date()) {
    throw new Error("Este token expiró.");
  }

  const membershipCount = await prisma.member.count({
    where: { userId: context.userId },
  });

  if (membershipCount > 0) {
    throw new Error("Ya perteneces a una organización.");
  }

  const result = await auth.api.createOrganization({
    body: { name: data.name, slug },
    headers: await headers(),
  });

  await prisma.inviteToken.update({
    where: { token: data.token },
    data: { usedAt: new Date(), usedByUserId: context.userId },
  });

  revalidatePath("/");

  return result;
}
