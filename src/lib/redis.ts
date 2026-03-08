import { createClient, type RedisClientType } from "redis";

let redisClient: RedisClientType | null = null;
let connectPromise: Promise<unknown> | null = null;
const DEFAULT_REDIS_CONNECT_TIMEOUT_MS = 150;

function getRedisUrl(): string {
  console.log(`Debug flow: getRedisUrl fired`);
  return process.env.REDIS_URL ?? "";
}

function getRedisClient(): RedisClientType | null {
  console.log(`Debug flow: getRedisClient fired`);
  const redisUrl = getRedisUrl();
  if (!redisUrl) {
    console.warn("Debug flow: REDIS_URL is not set; redis cache disabled");
    return null;
  }

  if (!redisClient) {
    redisClient = createClient({ url: redisUrl });
    redisClient.on("error", (error) => {
      console.error("Debug flow: redis client error", error);
    });
    if (!connectPromise) {
      connectPromise = redisClient.connect().finally(() => {
        connectPromise = null;
      });
    }
  }

  return redisClient;
}

function getRedisConnectTimeoutMs(): number {
  console.log(`Debug flow: getRedisConnectTimeoutMs fired`);
  const raw = Number(process.env.REDIS_CONNECT_TIMEOUT_MS);
  if (!Number.isFinite(raw) || raw <= 0) {
    return DEFAULT_REDIS_CONNECT_TIMEOUT_MS;
  }
  return Math.floor(raw);
}

async function ensureRedisConnected(client: RedisClientType): Promise<void> {
  console.log(`Debug flow: ensureRedisConnected fired`, { isOpen: client.isOpen });
  if (client.isOpen) {
    return;
  }

  if (!connectPromise) {
    connectPromise = client.connect().finally(() => {
      connectPromise = null;
    });
  }

  const timeoutMs = getRedisConnectTimeoutMs();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Redis connection timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    await Promise.race([connectPromise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export function isRedisEnabled(): boolean {
  console.log(`Debug flow: isRedisEnabled fired`);
  return getRedisUrl().length > 0;
}

export async function redisGetJson<T>(key: string): Promise<T | null> {
  console.log(`Debug flow: redisGetJson fired`, { key });
  const client = getRedisClient();
  if (!client) {
    return null;
  }

  try {
    await ensureRedisConnected(client);
    const raw = await client.get(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error("Debug flow: redisGetJson failed", { key, error });
    return null;
  }
}

export async function redisSetJson<T>(key: string, value: T, ttlMs: number): Promise<void> {
  console.log(`Debug flow: redisSetJson fired`, { key, ttlMs });
  const client = getRedisClient();
  if (!client) {
    return;
  }

  try {
    await ensureRedisConnected(client);
    const ttlSeconds = Math.max(1, Math.ceil(ttlMs / 1000));
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (error) {
    console.error("Debug flow: redisSetJson failed", { key, error });
  }
}

export async function redisDel(key: string): Promise<void> {
  console.log(`Debug flow: redisDel fired`, { key });
  const client = getRedisClient();
  if (!client) {
    return;
  }

  try {
    await ensureRedisConnected(client);
    await client.del(key);
  } catch (error) {
    console.error("Debug flow: redisDel failed", { key, error });
  }
}
