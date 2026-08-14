"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/users";
import { redirect } from "next/navigation";

export async function deleteAccountAction() {
  const data = await getCurrentUser();
  if (!data) throw new Error("Não autorizado.");

  if (data.user.isSuperUser) {
    throw new Error("A conta do Super Usuário não pode ser excluída.");
  }

  const userId = data.user.id;

  const person = await prisma.person.findUnique({
    where: { userId },
    select: { id: true, organizationId: true, role: true },
  });
  if (!person) throw new Error("Persona no encontrada.");

  // Verifica se é owner de alguma org sem outro owner
  if (person.role === "owner" && person.organizationId) {
    const otherOwners = await prisma.person.count({
      where: {
        organizationId: person.organizationId,
        role: "owner",
        id: { not: person.id },
      },
    });

    if (otherOwners === 0) {
      const org = await prisma.organization.findUnique({
        where: { id: person.organizationId },
        select: { name: true },
      });
      throw new Error(
        `Você é o único owner de "${org?.name}". Transfira a ownership antes de excluir sua conta.`,
      );
    }
  }

  // ✅ A pessoa permanece na organização intacta (nome, papel, cards e ownership) —
  // apenas o vínculo com a conta é removido e a conta do usuário é excluída.
  await prisma.person.update({
    where: { id: person.id },
    data: { userId: null },
  });

  // O cascade de User remove session/account; a Person já foi desvinculada.
  await prisma.user.delete({ where: { id: userId } });

  redirect("/login");
}
