"use client";

import { AppProgressBar } from "next-nprogress-bar";

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}

      {/* ✅ Barra de progresso — detecta <Link> automaticamente */}
      <AppProgressBar
        height="3px"
        color="#ff6828"
        options={{ showSpinner: false }}
        shallowRouting
      />
    </>
  );
}
