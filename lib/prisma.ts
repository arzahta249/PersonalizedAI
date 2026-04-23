import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL belum diset. Isi dengan runtime Postgres URL, idealnya pooled Supabase URL saat production."
  );
}

// 🔥 buat koneksi pool
const poolMax = Number(process.env.PG_POOL_MAX ?? (process.env.NODE_ENV === "production" ? 5 : 10));

const pool = new Pool({
  connectionString: databaseUrl,
  max: Number.isFinite(poolMax) && poolMax > 0 ? poolMax : undefined,
});

// 🔥 pakai adapter
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter, // ✅ INI WAJIB DI PRISMA 7
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
