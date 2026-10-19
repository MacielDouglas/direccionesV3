"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type NetworkStatus = {
  online: boolean;
  checking: boolean;
  verified: boolean;
  recheck: () => Promise<boolean>;
};

const NetworkStatusContext = createContext<NetworkStatus | null>(null);

async function hasConnection(): Promise<boolean> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(`/api/health?t=${Date.now()}`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function NetworkStatusProvider({ children }: { children: React.ReactNode }) {
  const [online, setOnline] = useState(true);
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const mountedRef = useRef(true);
  const checkingRef = useRef(false);

  const recheck = useCallback(async () => {
    if (checkingRef.current) return false;
    checkingRef.current = true;
    setChecking(true);

    const ok = await hasConnection();

    checkingRef.current = false;
    if (!mountedRef.current) return ok;

    setOnline(ok);
    setChecking(false);
    setVerified(true);
    return ok;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void recheck();

    const onOnline = () => {
      void recheck();
    };
    const onOffline = () => {
      setOnline(false);
      void recheck();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void recheck();
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      mountedRef.current = false;
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [recheck]);

  useEffect(() => {
    if (online) return;

    const id = window.setInterval(() => {
      void recheck();
    }, 8000);

    return () => window.clearInterval(id);
  }, [online, recheck]);

  const value = useMemo(
    () => ({ online, checking, verified, recheck }),
    [online, checking, verified, recheck],
  );

  return <NetworkStatusContext.Provider value={value}>{children}</NetworkStatusContext.Provider>;
}

export function useNetworkStatus(): NetworkStatus {
  const context = useContext(NetworkStatusContext);
  if (!context) {
    throw new Error("useNetworkStatus deve ser usado dentro de NetworkStatusProvider.");
  }
  return context;
}
