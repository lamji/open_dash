import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
};

// In production (Vercel), use standard Prisma client with DATABASE_URL (Postgres/MySQL/etc)
// In development, use better-sqlite3 adapter for local SQLite
let prismaInstance: PrismaClient;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

// Detect database type from URL
const dbUrl = process.env.DATABASE_URL;

if (dbUrl.startsWith("file:") || dbUrl.startsWith("./") || dbUrl.includes("prisma/dev.db")) {
  // SQLite with better-sqlite3 adapter
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  const adapter = new PrismaBetterSqlite3({ url: dbUrl });
  prismaInstance = new PrismaClient({ adapter });
} else {
  // PostgreSQL/MySQL - no adapter needed
  prismaInstance = new PrismaClient({} as any);
}

export const prisma = globalForPrisma.prisma ?? prismaInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
