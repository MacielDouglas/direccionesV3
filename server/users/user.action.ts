"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/users";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateNameSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(60, "El nombre no puede superar los 60 caracteres.")
    .trim(),
});

export async function updateUserNameAction(
  rawData: unknown,
): Promise<{ error?: string }> {
  const data = await getCurrentUser();
  if (!data) return { error: "No autorizado." };

  const parsed = updateNameSchema.safeParse(rawData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name } = parsed.data;

  // Verifica se o nome já está em uso por outro usuário
  const existing = await prisma.user.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      NOT: { id: data.user.id },
    },
    select: { id: true },
  });
  if (existing) return { error: "Este nombre ya está en uso." };

  await prisma.user.update({
    where: { id: data.user.id },
    data: { name },
  });

  revalidatePath("/", "layout");
  return {};
}
