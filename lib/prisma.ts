import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 🔥 buat koneksi pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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