"use server";

import type { AddressType } from "@/features/addresses/types/address.types";
import { prisma } from "@/lib/prisma";

export async function getNextCardNumber(organizationId: string): Promise<number> {
  const result = await prisma.card.aggregate({
    where: { organizationId },
    _max: { number: true },
  });
  return (result._max.number ?? 0) + 1;
}

export type AddressFilters = {
  active?: boolean; // true | false | undefined (todos)
  types?: AddressType[]; // [] = todos
};

export async function getAvailableAddresses(organizationId: string) {
  return prisma.address.findMany({
    where: {
      organizationId,
      cardId: null,
      pendingDeletion: false,
      // ✅ sem filtro active — o cliente filtra
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
      active: true, // ✅ adicionado
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
          type: true,
          street: true,
          number: true,
          neighborhood: true,
          city: true,
          businessName: true,
          latitude: true,
          longitude: true,
          active: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          user: { select: { id: true, email: true, image: true } },
        },
      },
      events: {
        where: { action: "RETURNED" },
        orderBy: { date: "desc" },
        take: 1,
        include: {
          person: { select: { id: true, name: true, user: { select: { image: true } } } },
        },
      },
    },
  });
}

export async function getAllAddresses(organizationId: string) {
  return prisma.address.findMany({
    where: { organizationId, pendingDeletion: false },
    select: {
      id: true,
      type: true,
      street: true,
      number: true,
      neighborhood: true,
      city: true,
      businessName: true,
      active: true,
      latitude: true,
      longitude: true,
      cardId: true,
      card: { select: { number: true } },
    },
    orderBy: { street: "asc" },
  });
}

export async function listMyCards(organizationId: string, personId: string) {
  return prisma.card.findMany({
    where: { organizationId, assignedPersonId: personId },
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
          active: true,
        },
      },
    },
  });
}

export async function countMyCards(organizationId: string, personId: string) {
  return prisma.card.count({
    where: { organizationId, assignedPersonId: personId },
  });
}

export async function countMyTotalAddresses(organizationId: string, personId: string) {
  const result = await prisma.address.count({
    where: {
      organizationId,
      card: { assignedPersonId: personId },
    },
  });
  return result;
}

export async function getOrgPersons(organizationId: string) {
  return prisma.person.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      role: true,
      organizationId: true,
      user: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getCardWithAddresses(cardId: string, organizationId: string) {
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
