"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

interface TenantOrganization {
  id: string;
  name: string;
  slug: string;
}

interface TenantMembership {
  role: string | null;
}

interface TenantContextValue {
  organization: TenantOrganization;
  membership: TenantMembership;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: TenantContextValue;
}) {
  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);

  if (!context) {
    throw new Error("useTenant debe usarse dentro de <TenantProvider>");
  }

  return context;
}
