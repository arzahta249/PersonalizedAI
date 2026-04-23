import fs from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";

import {
  exportDir,
  getEnv,
  getTableColumns,
  loadProjectEnv,
  maskConnectionString,
  normalizeValue,
  quoteIdentifier,
  requireEnv,
  tablesInDependencyOrder,
} from "./shared.mjs";

function printHelp() {
  console.log(`Usage: npm run db:import:supabase

Import JSON data from prisma/data-export into Supabase.

Required env:
  DIRECT_URL or TARGET_DATABASE_URL

Optional flags:
  --no-truncate   keep existing data and append rows instead of truncating first
`);
}

async function main() {
  if (process.argv.includes("--help")) {
    printHelp();
    return;
  }

  await loadProjectEnv();

  const connectionString = requireEnv("TARGET_DATABASE_URL", ["DIRECT_URL", "DATABASE_URL"]);
  const shouldTruncate = !process.argv.includes("--no-truncate");
  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query("BEGIN");

    if (shouldTruncate) {
      const truncateTargets = [...tablesInDependencyOrder]
        .reverse()
        .map((tableName) => `public.${quoteIdentifier(tableName)}`)
        .join(", ");

      await client.query(`TRUNCATE TABLE ${truncateTargets} RESTART IDENTITY CASCADE`);
    }

    for (const tableName of tablesInDependencyOrder) {
      const filePath = path.join(exportDir, `${tableName}.json`);
      const fileExists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);

      if (!fileExists) {
        continue;
      }

      const rows = JSON.parse(await fs.readFile(filePath, "utf8"));

      if (!Array.isArray(rows) || rows.length === 0) {
        continue;
      }

      const columns = await getTableColumns(client, tableName);
      const columnSql = columns.map(quoteIdentifier).join(", ");
      const placeholderSql = columns.map((_, index) => `$${index + 1}`).join(", ");
      const insertSql = `INSERT INTO public.${quoteIdentifier(tableName)} (${columnSql}) VALUES (${placeholderSql})`;

      for (const row of rows) {
        const values = columns.map((columnName) => normalizeValue(row[columnName]));
        await client.query(insertSql, values);
      }
    }

    await client.query("COMMIT");

    const mode = shouldTruncate ? "replace" : "append";
    console.log(`Import ${mode} selesai ke ${maskConnectionString(connectionString)} dari ${getEnv("TARGET_DATABASE_URL") ? "TARGET_DATABASE_URL" : "DIRECT_URL/DATABASE_URL"}.`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
