"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { Moon, Sun } from "lucide-react";

// useSyncExternalStore garante valor correto no server vs client sem useEffect
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {}, // subscribe — sem listeners necessários
    () => true, // getSnapshot client — montado
    () => false, // getServerSnapshot — não montado
  );
}

export default function DarkModeButton() {
  const { setTheme, theme } = useTheme();
  const isMounted = useIsMounted();

  if (!isMounted) {
    return (
      <Button variant="ghost" size="icon" aria-hidden disabled>
        <Sun className="h-[1.2rem] w-[1.2rem] opacity-0" aria-hidden />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      <Sun
        className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90 text-slate-100"
        aria-hidden="true"
      />
      <Moon
        className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0 text-slate-100"
        aria-hidden="true"
      />
    </Button>
  );
}
