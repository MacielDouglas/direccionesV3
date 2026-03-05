"use server";

import { getCurrentUser } from "@/server/users";
import {
  createAddressService,
  getAddressByIdService,
  updateAddressService,
} from "./address.service";
import type { AddressFormData } from "../domain/address.schema";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function getSessionOrThrow() {
  const session = await getCurrentUser();

  if (!session) throw new Error("No autenticado.");
  if (!session.activeMember?.organizationId) {
    throw new Error("El usuario no pertenece a ninguna organización activa.");
  }

  return {
    organizationId: session.activeMember.organizationId,
    userId: session.user.id,
  };
}

export async function createAddressAction(input: AddressFormData) {
  const { organizationId, userId } = await getSessionOrThrow();
  return createAddressService({ input, organizationId, userId });
}

export async function updateAddressAction(
  addressId: string,
  input: AddressFormData,
) {
  const { organizationId, userId } = await getSessionOrThrow();
  return updateAddressService({ addressId, input, organizationId, userId });
}

export async function getAddressByIdAction(addressId: string) {
  const { organizationId } = await getSessionOrThrow();
  return getAddressByIdService({ addressId, organizationId });
}

// Qualquer usuário — solicita deleção
export async function requestAddressDeletionAction(addressId: string) {
  const data = await getCurrentUser();
  if (!data) throw new Error("No autorizado.");

  const address = await prisma.address.findFirst({
    where: { id: addressId, organizationId: data.activeOrganization?.id },
  });
  if (!address) throw new Error("Dirección no encontrada.");

  await prisma.address.update({
    where: { id: addressId },
    data: {
      pendingDeletion: true,
      pendingDeletionAt: new Date(),
      pendingDeletionBy: data.user.id,
    },
  });

  revalidatePath(`/org/${data.activeOrganization?.slug}/addresses`);
}

// Admin/Owner — confirma deleção real
export async function confirmAddressDeletionAction(addressId: string) {
  const data = await getCurrentUser();
  if (!data) throw new Error("No autorizado.");

  const role = data.memberRole?.role;
  if (!role || !["admin", "owner"].includes(role)) {
    throw new Error("Sin permiso para confirmar eliminaciones.");
  }

  await prisma.address.delete({ where: { id: addressId } });

  revalidatePath(`/org/${data.activeOrganization?.slug}/addresses`);
}

// Admin/Owner — cancela solicitação
export async function cancelAddressDeletionAction(addressId: string) {
  const data = await getCurrentUser();
  if (!data) throw new Error("No autorizado.");

  await prisma.address.update({
    where: { id: addressId },
    data: {
      pendingDeletion: false,
      pendingDeletionAt: null,
      pendingDeletionBy: null,
    },
  });

  revalidatePath(`/org/${data.activeOrganization?.slug}/addresses`);
}
