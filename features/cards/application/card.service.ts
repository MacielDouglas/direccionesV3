"use server";

import { prisma } from "@/lib/prisma";

export async function getNextCardNumber(
  organizationId: string,
): Promise<number> {
  const result = await prisma.card.aggregate({
    where: { organizationId },
    _max: { number: true },
  });
  return (result._max.number ?? 0) + 1;
}

export async function getAvailableAddresses(organizationId: string) {
  return prisma.address.findMany({
    where: {
      organizationId,
      cardId: null,
      // active: true,
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
