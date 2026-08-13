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

  // ✅ Sempre: desatribui cards (ficam livres na org)
  await prisma.card.updateMany({
    where: { assignedPersonId: person.id, organizationId },
    data: { assignedPersonId: null },
  });

  if (person.role === "member") {
    // ✅ Membro comum: libera ownership dos cards e condução de eventos
    await prisma.card.updateMany({
      where: { ownerPersonId: person.id, organizationId },
      data: { ownerPersonId: null },
    });
    await prisma.agendaEvent.updateMany({
      where: { conductorPersonId: person.id, organizationId },
      data: { conductorPersonId: null },
    });
  }
  // Admin: ownership dos cards e condução da agenda são mantidos

  // ✅ Desvincula a person da organização
  await prisma.person.update({
    where: { id: person.id },
    data: { organizationId: null, role: null, lastActiveAt: new Date() },
  });

  redirect("/");
}
