"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/users";
import { revalidatePath } from "next/cache";

async function requireSuperUser() {
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.isSuperUser) {
    throw new Error("No autorizado.");
  }
  return currentUser;
}

// ── Dados do painel do super usuário ──────────────────────────
export async function getSuperUserPanelData() {
  await requireSuperUser();

  const [organizations, usersWithoutOrg] = await Promise.all([
    prisma.organization.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        _count: { select: { persons: true } },
      },
    }),
    prisma.user.findMany({
      where: { OR: [{ person: null }, { person: { organizationId: null } }] },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    }),
  ]);

  return { organizations, usersWithoutOrg };
}

// ── Excluir um usuário sem organização (apenas super usuário) ─
export async function superuserDeleteUserAction(userId: string) {
  await requireSuperUser();

  if (!userId) throw new Error("Usuario no encontrado.");

  const person = await prisma.person.findUnique({
    where: { userId },
    select: { id: true, organizationId: true },
  });
  if (person?.organizationId) {
    throw new Error("Solo se pueden eliminar usuarios sin organización.");
  }

  await prisma.$transaction(async (tx) => {
    if (person) {
      await tx.cardEvent.updateMany({
        where: { personId: person.id },
        data: { personId: null },
      });
      await tx.inviteToken.updateMany({
        where: { usedByPersonId: person.id },
        data: { usedByPersonId: null },
      });
      await tx.inviteToken.deleteMany({
        where: { OR: [{ personId: person.id }, { createdByPersonId: person.id }] },
      });
    }
    // Cascade remove a Person vinculada, session e account.
    await tx.user.delete({ where: { id: userId } });
  });

  revalidatePath("/");
  return { success: true };
}

// ── Enviar um usuário sem organização para uma organização ────
export async function superuserSendUserToOrganizationAction(
  userId: string,
  organizationId: string,
) {
  await requireSuperUser();

  if (!userId || !organizationId) {
    throw new Error("Datos incompletos.");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true },
  });
  if (!organization) throw new Error("Organización no encontrada.");

  const person = await prisma.person.findUnique({
    where: { userId },
    select: { id: true, organizationId: true },
  });
  if (!person) throw new Error("Este usuario no tiene una persona vinculada.");
  if (person.organizationId) {
    throw new Error("Este usuario ya pertenece a una organización.");
  }

  await prisma.person.update({
    where: { id: person.id },
    data: { organizationId: organization.id, role: "member", lastActiveAt: new Date() },
  });

  revalidatePath("/");
  return { success: true };
}
