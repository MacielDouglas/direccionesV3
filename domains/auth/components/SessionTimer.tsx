"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

interface SessionTimerProps {
  expiresAt: string | Date;
}

function getInterval(remaining: number): number {
  if (remaining <= 60_000) return 1_000; // últimos 60s — tick a cada 1s
  if (remaining <= 2 * 60_000) return 1_000; // últimos 2min — tick a cada 1s
  return 30_000; // resto — tick a cada 30s
}

export default function SessionTimer({ expiresAt }: SessionTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(expiresAt).getTime();
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      const remaining = target - Date.now();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        authClient.signOut().then(() => {
          window.location.href = "/login";
        });
        return;
      }

      // Agenda próximo tick com intervalo adaptativo
      timeoutId = setTimeout(tick, getInterval(remaining));
    };

    tick();
    return () => clearTimeout(timeoutId);
  }, [expiresAt]);

  if (timeLeft === null || timeLeft <= 0) return null;

  const totalSeconds = Math.ceil(timeLeft / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const isCountdown = timeLeft <= 60_000; // últimos 60s — mostra segundos
  const isCritical = timeLeft <= 5 * 60_000; // últimos 5min — fica vermelho

  return (
    <time
      dateTime={new Date(expiresAt).toISOString()}
      aria-live={isCritical ? "polite" : "off"}
      aria-label={
        isCountdown
          ? `Sesión expira en ${seconds} segundos`
          : `Sesión expira en ${minutes} minutos`
      }
      className={`font-mono text-sm font-semibold tabular-nums transition-colors ${
        isCritical ? "text-red-500" : "text-muted-foreground"
      }`}
    >
      {isCountdown ? (
        // Contagem regressiva em segundos
        <>
          {String(seconds).padStart(2, "0")}
          <span className="text-xs font-normal ml-0.5">s</span>
        </>
      ) : (
        // Exibe só os minutos restantes
        <>
          {minutes}
          <span className="text-xs font-normal ml-0.5">min</span>
        </>
      )}
    </time>
  );
}
