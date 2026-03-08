import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { redisDel, redisGetJson, redisSetJson } from "@/lib/redis";

const SALT_LENGTH = 32;
const KEY_LENGTH = 64;
const SESSION_EXPIRY_HOURS = 72;
const SESSION_CACHE_KEY_PREFIX = "session:";

interface SessionValidationResult {
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
  };
  session: {
    id: string;
    token: string;
    userId: string;
    expiresAt: string;
  };
}

function buildSessionCacheKey(token: string): string {
  console.log(`Debug flow: buildSessionCacheKey fired`);
  return `${SESSION_CACHE_KEY_PREFIX}${token}`;
}

// ─── Password Hashing (scrypt, no external deps) ───────────

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const derived = await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const derived = await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  const storedBuffer = Buffer.from(hash, "hex");
  return timingSafeEqual(derived, storedBuffer);
}

// ─── Session Management ─────────────────────────────────────

export async function createSession(userId: string): Promise<string> {
  console.log(`Debug flow: createSession fired`, { userId });
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);

  await prisma.session.create({
    data: { token, userId, expiresAt },
  });

  return token;
}

export async function validateSession(token: string) {
  console.log(`Debug flow: validateSession fired`, { hasToken: !!token });
  if (!token) return null;
  const cacheKey = buildSessionCacheKey(token);
  const cached = await redisGetJson<SessionValidationResult>(cacheKey);
  if (cached) {
    if (new Date(cached.session.expiresAt) > new Date()) {
      console.log(`Debug flow: validateSession cache hit`, { cacheKey });
      return cached;
    }
    void redisDel(cacheKey);
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    void redisDel(cacheKey);
    return null;
  }

  const result: SessionValidationResult = {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      createdAt: session.user.createdAt.toISOString(),
    },
    session: {
      id: session.id,
      token: session.token,
      userId: session.userId,
      expiresAt: session.expiresAt.toISOString(),
    },
  };
  const ttlMs = Math.max(1000, new Date(result.session.expiresAt).getTime() - Date.now());
  void redisSetJson(cacheKey, result, ttlMs);

  return result;
}

export async function deleteSession(token: string): Promise<void> {
  console.log(`Debug flow: deleteSession fired`, { hasToken: !!token });
  await prisma.session.deleteMany({ where: { token } });
  await redisDel(buildSessionCacheKey(token));
}

// ─── Rate Limiter (in-memory, per-process) ──────────────────

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now - entry.windowStart > 60 * 60 * 1000) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; retryAfterMs: number } {
  if (process.env.NODE_ENV !== "production") {
    return { allowed: true, retryAfterMs: 0 };
  }

  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= maxAttempts) {
    const retryAfterMs = windowMs - (now - entry.windowStart);
    return { allowed: false, retryAfterMs };
  }

  entry.count++;
  return { allowed: true, retryAfterMs: 0 };
}

// ─── Cookie Helpers ─────────────────────────────────────────

export const SESSION_COOKIE_NAME = "open-dash-session";

export function buildSessionCookie(token: string): string {
  const maxAge = SESSION_EXPIRY_HOURS * 60 * 60;
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

export function buildLogoutCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

// ─── Validation Helpers ─────────────────────────────────────

export function validateEmail(email: string): string | undefined {
  if (!email) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format";
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  return undefined;
}

export function validateName(name: string): string | undefined {
  if (!name) return "Name is required";
  if (name.length < 2) return "Name must be at least 2 characters";
  return undefined;
}
