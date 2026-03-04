"use server";

import { getActiveOrganizationService } from "@/domains/organization/services/getActiveOrganization";
import { getOrganizationBySlugService } from "@/domains/organization/services/getOrganizationBySlug";
import { listOrganizationsService } from "@/domains/organization/services/listOrganizations";

export async function getOrganizations() {
  return listOrganizationsService();
}

export async function getActiveOrganization(userId: string) {
  return getActiveOrganizationService(userId);
}

export async function getOrganizationBySlug(slug: string) {
  return getOrganizationBySlugService(slug);
}
