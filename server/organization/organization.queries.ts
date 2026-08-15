import { getOrganizationBySlugService } from "@/domains/organization/services/getOrganizationBySlug";
import { listOrganizationsService } from "@/domains/organization/services/listOrganizations";

export async function getOrganizations() {
  return listOrganizationsService();
}

export async function getOrganizationBySlug(slug: string) {
  return getOrganizationBySlugService(slug);
}
