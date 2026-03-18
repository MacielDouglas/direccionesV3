"use server";

import { prisma } from "@/lib/prisma";
import type { AddressFormData } from "../domain/address.schema";
import { addressFormSchema } from "../domain/address.schema";
import { cache } from "react";

export async function createAddressService(params: {
  input: AddressFormData;
  organizationId: string;
  userId: string;
}) {
  const data = addressFormSchema.parse(params.input);

  return prisma.address.create({
    data: {
      type: data.addressType,
      street: data.street,
      number: data.number,
      neighborhood: data.neighborhood,
      city: data.city,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      image: data.image.imageUrl ?? null,
      info: data.info ?? null,
      businessName: data.businessName ?? null,
      active: data.active,
      confirmed: data.confirmed,
      invited: data.invited,
      organizationId: params.organizationId,
      createdUserId: params.userId,
      updatedUserId: params.userId,
    },
  });
}

export async function updateAddressService({
  addressId,
  input,
  organizationId,
  userId,
}: {
  addressId: string;
  input: AddressFormData;
  organizationId: string;
  userId: string;
}) {
  const address = await prisma.address.findFirst({
    where: { id: addressId, organizationId },
    select: { id: true },
  });

  if (!address) throw new Error("Dirección no encontrada.");

  const {
    image,
    addressType,
    businessName,
    street,
    number,
    neighborhood,
    city,
    latitude,
    longitude,
    info,
    confirmed,
    active,
    invited,
  } = input;

  return prisma.address.update({
    where: { id: address.id },
    data: {
      type: addressType,
      businessName,
      street,
      number,
      neighborhood,
      city,
      latitude,
      longitude,
      info,
      confirmed,
      active,
      invited,
      image: image.imageUrl ?? null,
      updatedUserId: userId,
      updatedAt: new Date(),
    },
  });
}

export async function searchAddressesService(params: {
  organizationId: string;
  query?: string;
}) {
  const { organizationId, query } = params;

  return prisma.address.findMany({
    where: {
      organizationId,
      ...(query && {
        OR: [
          { street: { contains: query, mode: "insensitive" } },
          { neighborhood: { contains: query, mode: "insensitive" } },
          { city: { contains: query, mode: "insensitive" } },
          { businessName: { contains: query, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAddressByIdService(params: {
  addressId: string;
  organizationId: string;
}) {
  return prisma.address.findFirst({
    where: {
      id: params.addressId,
      organizationId: params.organizationId,
    },
  });
}

export const getAddressById = cache(async (addressId: string) => {
  return prisma.address.findUnique({ where: { id: addressId } });
});

export async function getExistingLocations(organizationId: string) {
  const addresses = await prisma.address.findMany({
    where: { organizationId },
    select: { neighborhood: true, city: true },
    distinct: ["neighborhood", "city"],
  });

  return {
    neighborhoods: [...new Set(addresses.map((a) => a.neighborhood))].sort(),
    cities: [...new Set(addresses.map((a) => a.city))].sort(),
  };
}
