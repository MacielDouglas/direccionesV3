"use client";

import { AppProgressBar } from "next-nprogress-bar";
import { createContext, useContext, useState, useCallback } from "react";

interface NavigationContextValue {
  isNavigating: boolean;
  startNavigation: () => void;
}

const NavigationContext = createContext<NavigationContextValue>({
  isNavigating: false,
  startNavigation: () => {},
});

export function useNavigation() {
  return useContext(NavigationContext);
}

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNavigating, setIsNavigating] = useState(false);

  const startNavigation = useCallback(() => {
    setIsNavigating(true);
    // Reset automático quando página carrega (rota muda)
    setTimeout(() => setIsNavigating(false), 3000);
  }, []);

  return (
    <NavigationContext.Provider value={{ isNavigating, startNavigation }}>
      {children}

      {/* ✅ Barra de progresso — detecta <Link> automaticamente */}
      <AppProgressBar
        height="3px"
        color="#ff6828"
        options={{ showSpinner: false }}
        shallowRouting
      />

      {/* ✅ Overlay global — feedback visual claro no mobile */}
      {isNavigating && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-background/40 backdrop-blur-[1px] transition-opacity"
        />
      )}
    </NavigationContext.Provider>
  );
}
