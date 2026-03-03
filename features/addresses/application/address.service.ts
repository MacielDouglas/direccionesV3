import { prisma } from "@/lib/prisma";
import { AddressFormData, addressFormSchema } from "../domain/address.schema";

export async function createAddressService(params: {
  input: AddressFormData;
  organizationId: string;
  userId: string;
}) {
  const data = await addressFormSchema.parse(params.input);

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
  });

  if (!address) throw new Error("Endereço não encontrado.");

  // ✅ Desestrutura separando campos do form dos campos do Prisma
  const {
    image,
    addressType, // ← campo do form
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
      type: addressType, // ✅ mapeado corretamente
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
// export async function updateAddressService(params: {
//   addressId: string;
//   input: Partial<AddressFormData>;
//   organizationId: string;
//   userId: string;
// }) {
//   const data = addressFormSchema.partial().parse(params.input);

//   const address = await prisma.address.findFirst({
//     where: {
//       id: params.addressId,
//       organizationId: params.organizationId,
//     },
//   });

//   if (!address) throw new Error("Endereço não encontrado.");

//   const { image, ...rest } = data;

//   return prisma.address.update({
//     where: { id: address.id },
//     data: {
//       ...rest,
//       image: image ? image.imageUrl : null,

//       updatedUserId: params.userId,
//     },
//   });
// }

export async function searchAddressesService(params: {
  organizationId: string;
  query?: string;
}) {
  const { organizationId, query } = params;

  return prisma.address.findMany({
    where: {
      organizationId,
      ...(query
        ? {
            OR: [
              { street: { contains: query, mode: "insensitive" } },
              { neighborhood: { contains: query, mode: "insensitive" } },
              { city: { contains: query, mode: "insensitive" } },
              { businessName: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
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
