import { prisma } from "@/lib/prisma";

export async function getNextCardNumber(
  organizationId: string,
): Promise<number> {
  const cards = await prisma.card.findMany({
    where: { organizationId },
    select: { number: true },
    orderBy: { number: "asc" },
  });
  const numbers = new Set(cards.map((c) => c.number));
  let next = 1;
  while (numbers.has(next)) next++;
  return next;
}

export async function getAvailableAddresses(organizationId: string) {
  return prisma.address.findMany({
    where: {
      organizationId,
      cardId: null,
      active: true,
      pendingDeletion: false,
    },
    select: {
      id: true,
      type: true,
      street: true,
      number: true,
      neighborhood: true,
      city: true,
      businessName: true,
      image: true,
      latitude: true,
      longitude: true,
    },
    orderBy: { street: "asc" },
  });
}

export async function listCards(organizationId: string) {
  return prisma.card.findMany({
    where: { organizationId },
    orderBy: { number: "asc" },
    include: {
      addresses: {
        select: {
          id: true,
          street: true,
          number: true,
          neighborhood: true,
          city: true,
          businessName: true,
          latitude: true,
          longitude: true,
        },
      },
      assignedUser: {
        select: { id: true, name: true, email: true, image: true },
      },
      events: {
        where: { action: "RETURNED" },
        orderBy: { date: "desc" },
        take: 1,
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });
}

export async function listMyCards(organizationId: string, userId: string) {
  return prisma.card.findMany({
    where: { organizationId, assignedUserId: userId },
    orderBy: { number: "asc" },
    include: {
      addresses: {
        select: {
          id: true,
          street: true,
          number: true,
          neighborhood: true,
          city: true,
          businessName: true,
          latitude: true,
          longitude: true,
          pendingDeletionAt: true,
        },
      },
    },
  });
}

export async function getOrgMembers(organizationId: string) {
  return prisma.member.findMany({
    where: { organizationId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { user: { name: "asc" } },
  });
}

export async function getCardWithAddresses(
  cardId: string,
  organizationId: string,
) {
  return prisma.card.findFirst({
    where: { id: cardId, organizationId },
    include: {
      addresses: {
        select: {
          id: true,
          type: true,
          street: true,
          number: true,
          neighborhood: true,
          city: true,
          businessName: true,
          image: true,
          latitude: true,
          longitude: true,
        },
      },
    },
  });
}
