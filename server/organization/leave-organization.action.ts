"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/users";
import { redirect } from "next/navigation";

export async function leaveOrganizationAction(organizationId: string) {
  const data = await getCurrentUser();
  if (!data) throw new Error("Não autorizado.");

  const person = await prisma.person.findFirst({
    where: { userId: data.user.id, organizationId },
    select: { id: true, role: true },
  });

  if (!person) throw new Error("Você não é membro desta organização.");

  if (person.role === "owner") {
    throw new Error("O owner não pode sair. Transfira a ownership antes.");
  }

  // ✅ A pessoa permanece na organização intacta (nome, papel, cards e ownership).
  // Apenas o vínculo com a conta do usuário é removido — vira "pessoa sem usuário".
  await prisma.person.update({
    where: { id: person.id },
    data: { userId: null, lastActiveAt: new Date() },
  });

  redirect("/");
}
