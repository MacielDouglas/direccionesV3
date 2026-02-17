"use client";

import { createContext, useContext } from "react";

type TenantContextValue = {
  organization: {
    id: string;
    name: string;
    slug: string;
  };

  membership: {
    role: string | null;
  };
};

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: TenantContextValue;
}) {
  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);

  if (!context) {
    throw new Error("useTenant must be used inside TenantProvider");
  }

  return context;
}
