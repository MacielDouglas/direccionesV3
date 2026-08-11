"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect } from "react";

export function SetActiveOrg({ organizationId }: { organizationId: string }) {
  useEffect(() => {
    authClient.organization.setActive({ organizationId });
  }, [organizationId]);

  return null;
}
