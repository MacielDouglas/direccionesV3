"use client";

import { getOfflineSnapshotAction } from "@/server/offline/offline.action";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNetworkStatus } from "./network-status";
import {
  alignOfflineScope,
  readCardsSnapshot,
  readMeetingsSnapshot,
  saveOfflineSnapshot,
} from "./offline-store";

type OfflineSyncContextValue = {
  online: boolean;
  ready: boolean;
  syncing: boolean;
  lastSyncedAt: string | null;
  error: boolean;
  syncNow: (force?: boolean) => Promise<boolean>;
};

const OfflineSyncContext = createContext<OfflineSyncContextValue | null>(null);

interface Props {
  organizationId: string;
  personId: string;
  children: React.ReactNode;
}

export function OfflineSyncProvider({ organizationId, personId, children }: Props) {
  const { online, verified } = useNetworkStatus();
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const syncingRef = useRef(false);
  const lastAttemptRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setReady(false);

    void (async () => {
      await alignOfflineScope(organizationId, personId);
      if (cancelled) return;

      const [cards, meetings] = await Promise.all([
        readCardsSnapshot(organizationId, personId),
        readMeetingsSnapshot(organizationId),
      ]);
      if (cancelled) return;

      const dates = [cards?.updatedAt, meetings?.updatedAt].filter((value): value is string =>
        Boolean(value),
      );
      dates.sort();

      setLastSyncedAt(dates.at(-1) ?? null);
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [organizationId, personId]);

  const syncNow = useCallback(
    async (force = false): Promise<boolean> => {
      if (!ready || !online || !verified) return false;
      if (syncingRef.current) return false;

      const now = Date.now();
      if (!force && now - lastAttemptRef.current < 15000) return false;
      lastAttemptRef.current = now;

      syncingRef.current = true;
      setSyncing(true);
      setError(false);

      try {
        const snapshot = await getOfflineSnapshotAction({ organizationId });
        if (!snapshot) {
          if (mountedRef.current) setError(true);
          return false;
        }

        await saveOfflineSnapshot(snapshot);
        if (!mountedRef.current) return true;

        setLastSyncedAt(snapshot.syncedAt);
        return true;
      } catch {
        if (mountedRef.current) setError(true);
        return false;
      } finally {
        syncingRef.current = false;
        if (mountedRef.current) setSyncing(false);
      }
    },
    [organizationId, online, ready, verified],
  );

  useEffect(() => {
    if (!ready || !online || !verified) return;
    void syncNow();
  }, [ready, online, verified, syncNow]);

  useEffect(() => {
    if (!ready) return;

    const onVisible = () => {
      if (document.visibilityState === "visible" && online) {
        void syncNow();
      }
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [ready, online, syncNow]);

  const value = useMemo(
    () => ({ online, ready, syncing, lastSyncedAt, error, syncNow }),
    [online, ready, syncing, lastSyncedAt, error, syncNow],
  );

  return <OfflineSyncContext.Provider value={value}>{children}</OfflineSyncContext.Provider>;
}

export function useOfflineSync(): OfflineSyncContextValue {
  const context = useContext(OfflineSyncContext);
  if (!context) {
    throw new Error("useOfflineSync deve ser usado dentro de OfflineSyncProvider.");
  }
  return context;
}
