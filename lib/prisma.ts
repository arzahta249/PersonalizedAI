import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
};

const databaseUrl =
  process.env.DATABASE_URL ??
  (process.env.NODE_ENV !== "production" ? process.env.DIRECT_URL : undefined);

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL belum diset. Isi dengan runtime Postgres URL, idealnya pooled Supabase URL saat production."
  );
}

const poolMax = Number(process.env.PG_POOL_MAX ?? (process.env.NODE_ENV === "production" ? 5 : 10));
const connectionTimeoutMillis = Number(process.env.PG_CONNECTION_TIMEOUT_MS ?? 10_000);

const rejectUnauthorizedEnv = process.env.PGSSL_REJECT_UNAUTHORIZED;
const rejectUnauthorized =
  rejectUnauthorizedEnv == null
    ? process.env.NODE_ENV === "production"
    : rejectUnauthorizedEnv.toLowerCase() !== "false";

const parsedDatabaseUrl = (() => {
  try {
    return new URL(databaseUrl);
  } catch {
    return null;
  }
})();

const normalizedDatabaseUrl = (() => {
  if (!parsedDatabaseUrl) return databaseUrl;

  const url = new URL(parsedDatabaseUrl);
  url.searchParams.delete("sslmode");
  return url.toString();
})();

const requiresSsl =
  databaseUrl.includes("sslmode=") ||
  parsedDatabaseUrl?.hostname.endsWith(".supabase.co") ||
  parsedDatabaseUrl?.hostname.endsWith(".pooler.supabase.com");

const pool = new Pool({
  connectionString: normalizedDatabaseUrl,
  max: Number.isFinite(poolMax) && poolMax > 0 ? poolMax : undefined,
  connectionTimeoutMillis:
    Number.isFinite(connectionTimeoutMillis) && connectionTimeoutMillis > 0
      ? connectionTimeoutMillis
      : 10_000,
  ssl: requiresSsl
    ? {
        rejectUnauthorized,
      }
    : undefined,
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
