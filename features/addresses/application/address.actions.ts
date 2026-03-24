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
import { deleteR2Object } from "@/infrastructure/storage/r2.service";

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

export async function requestAddressDeletionAction(
  addressId: string,
): Promise<{ error?: string }> {
  try {
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
    return {};
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "Error al solicitar eliminación.",
    };
  }
}

// ✅ Admin/Owner — confirma deleção real + deleta imagem do R2
export async function confirmAddressDeletionAction(addressId: string) {
  const data = await getCurrentUser();
  if (!data) throw new Error("No autorizado.");

  const role = data.memberRole?.role;
  if (!role || !["admin", "owner"].includes(role)) {
    throw new Error("Sin permiso para confirmar eliminaciones.");
  }

  // ✅ Busca imagem ANTES de deletar do banco
  const address = await prisma.address.findUnique({
    where: { id: addressId },
    select: { image: true },
  });

  // ✅ Deleta do banco
  await prisma.address.delete({ where: { id: addressId } });

  // ✅ Deleta imagem do R2 (após confirmar deleção do banco)
  const imageKey = extractKeyFromUrl(address?.image);
  if (imageKey) {
    try {
      await deleteR2Object(imageKey);
      console.log("✅ Imagen eliminada del R2:", imageKey);
    } catch (r2Error) {
      // Não falha a operação — banco já foi deletado
      console.warn("⚠️ No se pudo eliminar imagen del R2:", r2Error);
    }
  }

  revalidatePath(`/org/${data.activeOrganization?.slug}/addresses`);
}

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
