"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function leaveOrganizationAction(organizationId: string) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session) throw new Error("Não autorizado.");

  const userId = session.user.id;

  const member = await prisma.member.findFirst({
    where: { userId, organizationId },
    select: { id: true, role: true },
  });

  if (!member) throw new Error("Você não é membro desta organização.");

  if (member.role === "owner") {
    throw new Error("O owner não pode sair. Transfira a ownership antes.");
  }

  // ✅ Sempre: limpa assignedUserId (cards atribuídos ficam livres)
  await prisma.card.updateMany({
    where: { assignedUserId: userId, organizationId },
    data: { assignedUserId: null },
  });

  if (member.role === "member") {
    // ✅ Membro comum: limpa ownership dos cards
    await prisma.card.updateMany({
      where: { ownerId: userId, organizationId },
      data: { ownerId: null },
    });

    // ✅ Membro comum: limpa conductor de eventos na agenda
    await prisma.agendaEvent.updateMany({
      where: { conductorId: userId, organizationId },
      data: { conductorId: null },
    });
  }
  // Admin: ownerId dos cards e conductorId da agenda são mantidos

  // Remove da org via Better Auth
  await auth.api.removeMember({
    body: { memberIdOrEmail: member.id, organizationId },
    headers: reqHeaders,
  });

  // Limpa activeOrganizationId da sessão
  await auth.api.setActiveOrganization({
    body: { organizationId: null },
    headers: reqHeaders,
  });

  redirect("/");
}
