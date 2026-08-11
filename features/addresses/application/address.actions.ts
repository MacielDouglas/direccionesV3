"use server";

import { deleteR2Object } from "@/infrastructure/storage/r2.service";
import { prisma } from "@/lib/prisma";
import { requireAdminOrOwner, requireAuthContext } from "@/server/users";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { AddressFormData } from "../domain/address.schema";
import {
  createAddressService,
  getAddressByIdService,
  updateAddressService,
} from "./address.service";

const addressIdSchema = z.string().uuid();

// ✅ Extrai key da URL — mesma lógica do client
function extractKeyFromUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  const r2BaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";
  if (!r2BaseUrl || !imageUrl.startsWith(r2BaseUrl)) return null;
  const key = imageUrl.replace(`${r2BaseUrl}/`, "");
  // ✅ Proteção — nunca deleta security
  if (key.startsWith("security/")) return null;
  if (!key.startsWith("organizations/")) return null;
  return key;
}

async function getSessionOrThrow() {
  return requireAuthContext();
}

function getOrganizationId(data: Awaited<ReturnType<typeof requireAuthContext>>): string {
  const organizationId = data.activeMember?.organizationId;
  if (!organizationId) throw new Error("Sin organización activa.");
  return organizationId;
}

export async function createAddressAction(input: AddressFormData) {
  const data = await getSessionOrThrow();
  return createAddressService({
    input,
    organizationId: getOrganizationId(data),
    userId: data.user.id,
  });
}

export async function updateAddressAction(addressId: string, input: AddressFormData) {
  const data = await getSessionOrThrow();
  return updateAddressService({
    addressId,
    input,
    organizationId: getOrganizationId(data),
    userId: data.user.id,
  });
}

export async function getAddressByIdAction(addressId: string) {
  const data = await getSessionOrThrow();
  return getAddressByIdService({
    addressId,
    organizationId: getOrganizationId(data),
  });
}

export async function requestAddressDeletionAction(addressId: string): Promise<{ error?: string }> {
  try {
    if (!addressIdSchema.safeParse(addressId).success) {
      return { error: "Dirección inválida." };
    }
    const data = await requireAuthContext();
    const organizationId = getOrganizationId(data);

    const address = await prisma.address.findFirst({
      where: { id: addressId, organizationId },
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
    return {};
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Error al solicitar eliminación.",
    };
  }
}

// ✅ Admin/Owner — confirma deleção real + deleta imagem do R2
export async function confirmAddressDeletionAction(addressId: string) {
  if (!addressIdSchema.safeParse(addressId).success) {
    throw new Error("Dirección inválida.");
  }

  const data = await requireAdminOrOwner();
  const organizationId = getOrganizationId(data);

  // ✅ Busca imagem ANTES de deletar do banco (escopado pela org)
  const address = await prisma.address.findFirst({
    where: { id: addressId, organizationId },
    select: { image: true },
  });
  if (!address) throw new Error("Dirección no encontrada.");

  // ✅ Deleta do banco
  await prisma.address.delete({ where: { id: addressId } });

  // ✅ Deleta imagem do R2 (após confirmar deleção do banco)
  const imageKey = extractKeyFromUrl(address.image);
  if (imageKey) {
    try {
      await deleteR2Object(imageKey);
    } catch {
      // Não falha a operação — banco já foi deletado
    }
  }

  revalidatePath(`/org/${data.activeOrganization?.slug}/addresses`);
}

export async function cancelAddressDeletionAction(addressId: string) {
  if (!addressIdSchema.safeParse(addressId).success) {
    throw new Error("Dirección inválida.");
  }

  const data = await requireAdminOrOwner();
  const organizationId = getOrganizationId(data);

  const address = await prisma.address.findFirst({
    where: { id: addressId, organizationId },
    select: { id: true },
  });
  if (!address) throw new Error("Dirección no encontrada.");

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
