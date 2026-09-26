"use server";

import { getServerDictionary } from "@/lib/i18n/server";
import { requireOrgAdminOrOwner } from "@/server/users";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { mergeSavedTextsSchema, renameSavedTextSchema } from "../domain/saved-text.schema";
import { mergeSavedTexts, renameSavedText } from "./saved-text.service";

const organizationIdSchema = z.string().min(1);

async function revalidateSavedTextPaths(organizationSlug: string) {
  revalidatePath(`/org/${organizationSlug}/admin/textos`);
  revalidatePath(`/org/${organizationSlug}/admin/agenda`);
  revalidatePath(`/org/${organizationSlug}/agenda`);
  revalidatePath(`/org/${organizationSlug}/addresses`);
}

export async function renameSavedTextAction(
  organizationId: string,
  organizationSlug: string,
  input: { field: string; from: string; to: string },
): Promise<{ error?: string }> {
  try {
    if (!organizationIdSchema.safeParse(organizationId).success) {
      return { error: "Organización inválida." };
    }
    await requireOrgAdminOrOwner(organizationId);
    const parsed = renameSavedTextSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    await renameSavedText({ organizationId, ...parsed.data });
    await revalidateSavedTextPaths(organizationSlug);
    return {};
  } catch (err) {
    const t = await getServerDictionary();
    return { error: err instanceof Error ? err.message : t.errors.generic };
  }
}

export async function mergeSavedTextsAction(
  organizationId: string,
  organizationSlug: string,
  input: { field: string; froms: string[]; to: string },
): Promise<{ error?: string }> {
  try {
    if (!organizationIdSchema.safeParse(organizationId).success) {
      return { error: "Organización inválida." };
    }
    await requireOrgAdminOrOwner(organizationId);
    const parsed = mergeSavedTextsSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    await mergeSavedTexts({ organizationId, ...parsed.data });
    await revalidateSavedTextPaths(organizationSlug);
    return {};
  } catch (err) {
    const t = await getServerDictionary();
    return { error: err instanceof Error ? err.message : t.errors.generic };
  }
}
