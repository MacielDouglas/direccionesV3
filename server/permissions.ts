"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const isAdmin = async (): Promise<boolean> => {
  try {
    const { success, error } = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permissions: { project: ["create", "update", "delete"] },
      },
    });

    if (error) {
      console.error("[isAdmin] Error al verificar permiso:", error);
      return false;
    }

    return success ?? false;
  } catch (error) {
    console.error("[isAdmin] Excepción al verificar permiso:", error);
    return false;
  }
};
