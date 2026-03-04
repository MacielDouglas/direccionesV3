"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

interface SessionTimerProps {
  expiresAt: string | Date;
}

export default function SessionTimer({ expiresAt }: SessionTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(expiresAt).getTime();

    const tick = () => {
      const remaining = target - Date.now();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        authClient.signOut().then(() => {
          window.location.href = "/login";
        });
      }
    };

    tick(); // executa imediatamente ao montar
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  // SSR / hidratação: não renderiza até ter valor
  if (timeLeft === null) return null;

  if (timeLeft <= 0) return null;

  const minutes = Math.floor(timeLeft / 1000 / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor((timeLeft / 1000) % 60)
    .toString()
    .padStart(2, "0");
  const isCritical = timeLeft <= 10 * 60 * 1000;

  return (
    <time
      dateTime={new Date(new Date(expiresAt).getTime()).toISOString()}
      aria-label={`Sesión expira en ${minutes} minutos y ${seconds} segundos`}
      aria-live="off"
      className={`font-mono text-sm font-semibold tabular-nums ${
        isCritical ? "text-red-500" : "text-muted-foreground"
      }`}
    >
      {minutes}:{seconds}
    </time>
  );
}
