import fs from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";

import {
  ensureExportDir,
  exportDir,
  getTableColumns,
  loadProjectEnv,
  maskConnectionString,
  requireEnv,
  tablesInDependencyOrder,
} from "./shared.mjs";

function printHelp() {
  console.log(`Usage: npm run db:export:postgres

Export legacy PostgreSQL data into prisma/data-export/*.json.

Required env:
  SOURCE_DATABASE_URL
`);
}

async function main() {
  if (process.argv.includes("--help")) {
    printHelp();
    return;
  }

  await loadProjectEnv();
  await ensureExportDir();

  const connectionString = requireEnv("SOURCE_DATABASE_URL");
  const client = new Client({ connectionString });
  await client.connect();

  const summary = {};

  try {
    for (const tableName of tablesInDependencyOrder) {
      const columns = await getTableColumns(client, tableName);

      if (columns.length === 0) {
        summary[tableName] = 0;
        continue;
      }

      const orderBy = columns.includes("id") ? ' ORDER BY "id"' : "";
      const result = await client.query(`SELECT * FROM public."${tableName}"${orderBy}`);
      const targetPath = path.join(exportDir, `${tableName}.json`);

      await fs.writeFile(targetPath, JSON.stringify(result.rows, null, 2));
      summary[tableName] = result.rowCount ?? result.rows.length;
    }

    const metadataPath = path.join(exportDir, "_meta.json");
    const metadata = {
      exportedAt: new Date().toISOString(),
      source: maskConnectionString(connectionString),
      tables: summary,
    };

    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    console.log(`Export selesai dari ${maskConnectionString(connectionString)} ke ${exportDir}.`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
