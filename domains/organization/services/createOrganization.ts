import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
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

  // ✅ Todo usuário logado possui sua Person (1:1) — garante a criação
  const person = await prisma.person.findUnique({
    where: { userId: context.userId },
    select: { id: true, organizationId: true },
  });

  if (!person) {
    throw new Error("No hay una persona vinculada a la cuenta.");
  }
  if (person.organizationId) {
    throw new Error("Ya perteneces a una organización.");
  }

  const organization = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: { name: data.name, slug },
    });

    await tx.person.update({
      where: { id: person.id },
      data: { organizationId: org.id, role: "owner", lastActiveAt: new Date() },
    });

    await tx.inviteToken.update({
      where: { token: data.token },
      data: { usedAt: new Date(), usedByPersonId: person.id },
    });

    return org;
  });

  revalidatePath("/");

  return organization;
}
