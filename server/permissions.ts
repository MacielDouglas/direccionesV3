"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const isAdmin = async () => {
  try {
    const { success, error } = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permissions: { project: ["create", "update", "delete"] },
      },
    });

    if (error) {
      return {
        success: false,
        error: error || "Falha ao verificar permissão",
      };
    }

    return success;
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: error || "Falha ao verificar permissão",
    };
  } // sempre boolean
};
