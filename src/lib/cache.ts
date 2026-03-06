import type { CacheChangeEvent } from "@/domain/cache/types";

type CacheEntry = {
  value: unknown;
  expiresAt: number;
};

const cacheStore = new Map<string, CacheEntry>();
const cacheListeners = new Set<(event: CacheChangeEvent) => void>();

function emitCacheEvent(event: CacheChangeEvent): void {
  console.log(`Debug flow: emitCacheEvent fired with`, { event, listenerCount: cacheListeners.size });
  cacheListeners.forEach((listener) => listener(event));
}

export function getCache<T>(key: string): T | null {
  console.log(`Debug flow: getCache fired with`, { key, cacheSize: cacheStore.size });
  const entry = cacheStore.get(key);
  if (!entry) {
    console.log(`Debug flow: getCache miss`, { key });
    return null;
  }
  const now = Date.now();
  if (now > entry.expiresAt) {
    cacheStore.delete(key);
    console.log(`Debug flow: getCache expired entry`, { key });
    return null;
  }
  console.log(`Debug flow: getCache hit`, { key, expiresIn: entry.expiresAt - now });
  return entry.value as T;
}

export async function getOrLoadCache<T>(
  key: string,
  loader: () => Promise<T>,
  ttlMs = 30_000
): Promise<T> {
  console.log(`Debug flow: getOrLoadCache fired with`, { key, ttlMs });
  const cachedValue = getCache<T>(key);
  if (cachedValue !== null) {
    return cachedValue;
  }
  const loadedValue = await loader();
  setCache(key, loadedValue, ttlMs);
  return loadedValue;
}

export function setCache<T>(key: string, value: T, ttlMs = 30_000): void {
  const expiresAt = Date.now() + ttlMs;
  cacheStore.set(key, { value, expiresAt });
  console.log(`Debug flow: setCache fired with`, { key, ttlMs, expiresAt, cacheSize: cacheStore.size });
  emitCacheEvent({ key, action: "set", timestamp: new Date().toISOString() });
}

export function invalidateCache(key: string): void {
  console.log(`Debug flow: invalidateCache fired with`, { key });
  cacheStore.delete(key);
  emitCacheEvent({ key, action: "invalidate", timestamp: new Date().toISOString() });
}

export function subscribeToCacheEvents(
  listener: (event: CacheChangeEvent) => void
): () => void {
  console.log(`Debug flow: subscribeToCacheEvents fired with`, { listenerCount: cacheListeners.size });
  cacheListeners.add(listener);
  return () => {
    console.log(`Debug flow: subscribeToCacheEvents cleanup fired with`, { listenerCount: cacheListeners.size });
    cacheListeners.delete(listener);
  };
}
