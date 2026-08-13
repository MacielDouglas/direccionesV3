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
    select: { id: true },
  });
  if (!person) throw new Error("Persona no encontrada.");

  // Busca a organização da person
  const membership = await prisma.person.findUnique({
    where: { userId },
    select: { organizationId: true, role: true },
  });

  // Verifica se é owner de alguma org sem outro owner
  if (membership?.role === "owner" && membership.organizationId) {
    const otherOwners = await prisma.person.count({
      where: {
        organizationId: membership.organizationId,
        role: "owner",
        id: { not: person.id },
      },
    });

    if (otherOwners === 0) {
      const org = await prisma.organization.findUnique({
        where: { id: membership.organizationId },
        select: { name: true },
      });
      throw new Error(
        `Você é o único owner de "${org?.name}". Transfira a ownership antes de excluir sua conta.`,
      );
    }
  }

  // Orgs onde é membro comum → limpa ownerPersonId dos cards
  if (membership?.role === "member" && membership.organizationId) {
    await prisma.card.updateMany({
      where: { ownerPersonId: person.id, organizationId: membership.organizationId },
      data: { ownerPersonId: null },
    });
  }

  // Todas as referências → limpa assignedPersonId
  await prisma.card.updateMany({
    where: { assignedPersonId: person.id },
    data: { assignedPersonId: null },
  });

  // Limpa conductor da agenda
  await prisma.agendaEvent.updateMany({
    where: { conductorPersonId: person.id },
    data: { conductorPersonId: null },
  });

  // Nullifica survey pins
  await prisma.surveyPin.updateMany({
    where: { confirmedByPersonId: person.id },
    data: { confirmedByPersonId: null },
  });

  // Deleta card events da pessoa
  await prisma.cardEvent.deleteMany({
    where: { personId: person.id },
  });

  // Nullifica referências em Address (mantém o address, limpa o vínculo)
  await prisma.address.updateMany({
    where: { invitedByPersonId: person.id },
    data: { invitedByPersonId: null },
  });
  await prisma.address.updateMany({
    where: { updatedByPersonId: person.id },
    data: { updatedByPersonId: null },
  });
  await prisma.address.updateMany({
    where: { pendingDeletionByPersonId: person.id },
    data: {
      pendingDeletionByPersonId: null,
      pendingDeletion: false,
      pendingDeletionAt: null,
    },
  });

  // ✅ Deleta o usuário — cascade remove session, account e a person vinculada (userId FK cascade)
  await prisma.user.delete({ where: { id: userId } });

  redirect("/login");
}
