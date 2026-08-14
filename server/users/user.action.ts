"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/users";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateLanguageSchema = z.object({
  language: z.enum(["pt", "es"]),
});

export async function updateUserLanguageAction(rawData: unknown): Promise<{ error?: string }> {
  const data = await getCurrentUser();
  if (!data) return { error: "No autorizado." };

  const parsed = updateLanguageSchema.safeParse(rawData);
  if (!parsed.success) return { error: "Idioma inválido." };

  await prisma.user.update({
    where: { id: data.user.id },
    data: { language: parsed.data.language },
  });

  revalidatePath("/", "layout");
  return {};
}
