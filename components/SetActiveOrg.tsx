"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export function SetActiveOrg({ organizationId }: { organizationId: string }) {
  useEffect(() => {
    authClient.organization.setActive({ organizationId });
  }, [organizationId]);

  return null;
}