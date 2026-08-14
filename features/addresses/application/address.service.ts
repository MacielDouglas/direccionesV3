"use server";

import { prisma } from "@/lib/prisma";
import type { AddressFormData } from "../domain/address.schema";
import { addressCreateSchema } from "../domain/address.schema";
import { sanitizeInfo } from "../utils/sanitizeInfo";

export async function createAddressService(params: {
  input: AddressFormData;
  organizationId: string;
  personId: string;
}) {
  const data = addressCreateSchema.parse(params.input);

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
      info: sanitizeInfo(data.info ?? null),
      businessName: data.businessName ?? null,
      active: data.active,
      confirmed: data.confirmed,
      invited: data.invited,
      organizationId: params.organizationId,
      createdByPersonId: params.personId,
      updatedByPersonId: params.personId,
    },
  });
}

export async function updateAddressService({
  addressId,
  input,
  organizationId,
  personId,
}: {
  addressId: string;
  input: AddressFormData;
  organizationId: string;
  personId: string;
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
      info: sanitizeInfo(info ?? null),
      confirmed,
      active,
      invited,
      image: image.imageUrl ?? null,
      updatedByPersonId: personId,
      updatedAt: new Date(),
    },
  });
}

export async function getAddressByIdService({
  addressId,
  organizationId,
}: {
  addressId: string;
  organizationId: string;
}) {
  return prisma.address.findFirst({
    where: { id: addressId, organizationId },
  });
}

export async function searchAddressesService({
  organizationId,
  query,
}: {
  organizationId: string;
  query?: string;
}) {
  const q = query?.trim();
  return prisma.address.findMany({
    where: {
      organizationId,
      ...(q
        ? {
            OR: [
              { street: { contains: q, mode: "insensitive" } },
              { number: { contains: q, mode: "insensitive" } },
              { businessName: { contains: q, mode: "insensitive" } },
              { neighborhood: { contains: q, mode: "insensitive" } },
              { city: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getExistingLocations(organizationId: string) {
  const addresses = await prisma.address.findMany({
    where: { organizationId },
    select: { neighborhood: true, city: true },
  });
  return {
    neighborhoods: [...new Set(addresses.map((a) => a.neighborhood))].sort(),
    cities: [...new Set(addresses.map((a) => a.city))].sort(),
  };
}
