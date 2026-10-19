import type {
  OfflineCardsSnapshot,
  OfflineMeetingsSnapshot,
  OfflineSnapshot,
} from "../types/offline.types";

const DB_NAME = "direcciones-offline";
const DB_VERSION = 1;
const STORE_NAME = "snapshots";
const ACTIVE_SCOPE_KEY = "direcciones:offline-active-scope";

const USER_CACHE_PREFIXES = [
  "pages",
  "api-cache",
  "start-url",
  "next-image",
  "cross-origin",
  "others",
  "r2-images",
  "mapbox-tiles",
];

function cardsKey(organizationId: string, personId: string) {
  return `cards:${organizationId}:${personId}`;
}

function meetingsKey(organizationId: string) {
  return `meetings:${organizationId}`;
}

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function readRecord<T>(key: string): Promise<T | null> {
  const db = await openDb();
  if (!db) return null;

  try {
    return await new Promise<T | null>((resolve) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve((request.result as T | undefined) ?? null);
      request.onerror = () => resolve(null);
    });
  } finally {
    db.close();
  }
}

async function writeRecord(key: string, value: unknown): Promise<boolean> {
  const db = await openDb();
  if (!db) return false;

  try {
    return await new Promise<boolean>((resolve) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(value, key);
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => resolve(false);
      transaction.onabort = () => resolve(false);
    });
  } finally {
    db.close();
  }
}

export async function saveOfflineSnapshot(snapshot: OfflineSnapshot): Promise<void> {
  if (snapshot.cards) {
    await writeRecord(cardsKey(snapshot.organizationId, snapshot.personId), snapshot.cards);
  }
  if (snapshot.meetings) {
    await writeRecord(meetingsKey(snapshot.organizationId), snapshot.meetings);
  }
}

export async function readCardsSnapshot(
  organizationId: string,
  personId: string,
): Promise<OfflineCardsSnapshot | null> {
  return readRecord<OfflineCardsSnapshot>(cardsKey(organizationId, personId));
}

export async function readMeetingsSnapshot(
  organizationId: string,
): Promise<OfflineMeetingsSnapshot | null> {
  return readRecord<OfflineMeetingsSnapshot>(meetingsKey(organizationId));
}

export async function clearOfflineData(): Promise<void> {
  const db = await openDb();
  if (!db) return;

  try {
    await new Promise<void>((resolve) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).clear();
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
      transaction.onabort = () => resolve();
    });
  } finally {
    db.close();
  }
}

export function getActiveOfflineScope(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(ACTIVE_SCOPE_KEY);
  } catch {
    return null;
  }
}

export function setActiveOfflineScope(scope: string): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(ACTIVE_SCOPE_KEY, scope);
  } catch {
    // Sem localStorage: segue sem limpeza automática entre escopos.
  }
}

export function clearActiveOfflineScope(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(ACTIVE_SCOPE_KEY);
  } catch {
    // Ignora ambientes sem localStorage.
  }
}

export async function clearUserCaches(): Promise<void> {
  if (typeof caches === "undefined") return;

  try {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) =>
          USER_CACHE_PREFIXES.some((prefix) => key === prefix || key.startsWith(`${prefix}-`)),
        )
        .map((key) => caches.delete(key)),
    );
  } catch {
    // Cache Storage indisponível (modo privado/navegador antigo).
  }
}

/**
 * Garante que o IndexedDB só contenha dados do usuário/organização ativos.
 * Ao trocar de organização ou de conta, apaga snapshots e caches de páginas.
 */
export async function alignOfflineScope(organizationId: string, personId: string): Promise<void> {
  const nextScope = `${organizationId}:${personId}`;
  const activeScope = getActiveOfflineScope();

  if (activeScope && activeScope !== nextScope) {
    await Promise.all([clearOfflineData(), clearUserCaches()]);
  }

  setActiveOfflineScope(nextScope);
}

export async function clearOfflineSession(): Promise<void> {
  await Promise.all([clearOfflineData(), clearUserCaches()]);
  clearActiveOfflineScope();
}
