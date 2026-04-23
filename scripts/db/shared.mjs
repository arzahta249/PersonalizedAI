import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const projectRoot = path.resolve(__dirname, "..", "..");
export const exportDir = path.join(projectRoot, "prisma", "data-export");
export const baselineSqlPath = path.join(projectRoot, "prisma", "supabase-baseline.sql");

export const tablesInDependencyOrder = [
  "User",
  "Course",
  "Module",
  "Lesson",
  "Quiz",
  "Question",
  "Progress",
  "AIRecommendation",
  "Assignment",
  "QuizResult",
  "AssignmentSubmission",
];

export async function loadProjectEnv() {
  const envPath = path.join(projectRoot, ".env");

  try {
    const contents = await fs.readFile(envPath, "utf8");

    for (const rawLine of contents.split(/\r?\n/)) {
      const match = rawLine.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);

      if (!match) {
        continue;
      }

      const [, key, rawValue] = match;

      if (process.env[key] !== undefined) {
        continue;
      }

      let value = rawValue.trim();

      if (!value) {
        process.env[key] = "";
        continue;
      }

      const isWrappedInSingleQuotes = value.startsWith("'") && value.endsWith("'");
      const isWrappedInDoubleQuotes = value.startsWith("\"") && value.endsWith("\"");

      if (isWrappedInSingleQuotes || isWrappedInDoubleQuotes) {
        value = value.slice(1, -1);
      }

      process.env[key] = value.replace(/\\n/g, "\n");
    }
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return;
    }

    throw error;
  }
}

export function getEnv(name, fallbacks = []) {
  const candidates = [name, ...fallbacks];

  for (const candidate of candidates) {
    const value = process.env[candidate];

    if (value && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

export function requireEnv(name, fallbacks = []) {
  const value = getEnv(name, fallbacks);

  if (!value) {
    const aliases = fallbacks.length > 0 ? ` (fallback: ${fallbacks.join(", ")})` : "";
    throw new Error(`Environment variable ${name} belum diisi${aliases}.`);
  }

  return value;
}

export async function ensureExportDir() {
  await fs.mkdir(exportDir, { recursive: true });
}

export function quoteIdentifier(value) {
  return `"${value.replace(/"/g, "\"\"")}"`;
}

export function maskConnectionString(connectionString) {
  try {
    const url = new URL(connectionString);
    const port = url.port ? `:${url.port}` : "";
    return `${url.protocol}//${url.username ? `${url.username}:***@` : ""}${url.hostname}${port}${url.pathname}`;
  } catch {
    return "[invalid-connection-string]";
  }
}

export async function getTableColumns(client, tableName) {
  const result = await client.query(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position
    `,
    [tableName]
  );

  return result.rows.map((row) => row.column_name);
}

export function normalizeValue(value) {
  if (value === undefined) {
    return null;
  }

  return value;
}

export async function readJsonFile(filePath) {
  const contents = await fs.readFile(filePath, "utf8");
  return JSON.parse(contents);
}
