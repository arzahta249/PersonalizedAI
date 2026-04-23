import fs from "node:fs/promises";
import { Client } from "pg";

import {
  baselineSqlPath,
  loadProjectEnv,
  maskConnectionString,
  requireEnv,
} from "./shared.mjs";

function printHelp() {
  console.log(`Usage: npm run db:supabase:bootstrap

Bootstrap a fresh Supabase database with the SQL snapshot generated from prisma/schema.prisma.

Required env:
  DIRECT_URL    direct Supabase connection string

Optional flags:
  --force       allow running even when public tables already exist
`);
}

async function main() {
  if (process.argv.includes("--help")) {
    printHelp();
    return;
  }

  await loadProjectEnv();

  const connectionString = requireEnv("DIRECT_URL", ["DATABASE_URL"]);
  const allowForce = process.argv.includes("--force");
  const sql = await fs.readFile(baselineSqlPath, "utf8");

  const client = new Client({ connectionString });
  await client.connect();

  try {
    const existingTables = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename <> '_prisma_migrations'
      ORDER BY tablename
    `);

    if (existingTables.rowCount > 0 && !allowForce) {
      const tableList = existingTables.rows.map((row) => row.tablename).join(", ");
      throw new Error(
        `Database target tidak kosong (${tableList}). Jalankan lagi dengan --force jika memang ingin bootstrap di database ini.`
      );
    }

    await client.query(sql);

    console.log(`Supabase schema berhasil dibootstrap ke ${maskConnectionString(connectionString)}.`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
