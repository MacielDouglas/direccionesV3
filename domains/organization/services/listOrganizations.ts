import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function listOrganizationsService() {
  return auth.api.listOrganizations({
    headers: await headers(),
  });
}
