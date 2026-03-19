"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function deleteAccountAction() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session) throw new Error("Não autorizado.");

  const userId = session.user.id;

  // Busca todos os memberships do usuário
  const memberships = await prisma.member.findMany({
    where: { userId },
    select: { organizationId: true, role: true },
  });

  // Verifica se é owner de alguma org sem outro owner
  for (const membership of memberships) {
    if (membership.role === "owner") {
      const otherOwners = await prisma.member.count({
        where: {
          organizationId: membership.organizationId,
          role: "owner",
          userId: { not: userId },
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
  }

  const orgIds = memberships.map((m) => m.organizationId);
  const memberRoles = Object.fromEntries(
    memberships.map((m) => [m.organizationId, m.role]),
  );

  // Orgs onde é membro comum → limpa ownerId dos cards
  const memberOrgIds = orgIds.filter((id) => memberRoles[id] === "member");

  if (memberOrgIds.length > 0) {
    await prisma.card.updateMany({
      where: { ownerId: userId, organizationId: { in: memberOrgIds } },
      data: { ownerId: null },
    });
  }

  // Todas as orgs → limpa assignedUserId
  if (orgIds.length > 0) {
    await prisma.card.updateMany({
      where: { assignedUserId: userId },
      data: { assignedUserId: null },
    });

    // Limpa conductor da agenda
    await prisma.agendaEvent.updateMany({
      where: { conductorId: userId },
      data: { conductorId: null },
    });
  }

  // Nullifica survey pins
  await prisma.surveyPin.updateMany({
    where: { createdById: userId },
    data: { createdById: userId }, // mantém — não pode nullificar (required)
  });
  await prisma.surveyPin.updateMany({
    where: { confirmedById: userId },
    data: { confirmedById: null },
  });

  // Deleta card events do usuário
  await prisma.cardEvent.deleteMany({
    where: { userId },
  });

  // Nullifica referências em Address (mantém o address, limpa o vínculo)
  await prisma.address.updateMany({
    where: { invitedById: userId },
    data: { invitedById: null },
  });
  await prisma.address.updateMany({
    where: { updatedUserId: userId },
    data: { updatedUserId: null },
  });
  await prisma.address.updateMany({
    where: { pendingDeletionBy: userId },
    data: {
      pendingDeletionBy: null,
      pendingDeletion: false,
      pendingDeletionAt: null,
    },
  });

  // Deleta o usuário (cascade deleta session, account, member, invitation, invite_token)
  await prisma.user.delete({ where: { id: userId } });

  redirect("/login");
}
