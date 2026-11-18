import { loadEnvConfig } from "@next/env";
import { getDatabase } from "../lib/db";
import { defaultContent } from "../lib/default-content";
import { contentSchema } from "../lib/content-schema";

async function main() {
  loadEnvConfig(process.cwd());
  const db = getDatabase();
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS wedding_site_content (
      id smallint PRIMARY KEY CHECK (id = 1),
      content jsonb NOT NULL,
      revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`);
    const result = await db.query(
      "INSERT INTO wedding_site_content (id, content) VALUES (1, $1::jsonb) ON CONFLICT (id) DO NOTHING",
      [JSON.stringify(contentSchema.parse(defaultContent))],
    );
    console.log(result.rowCount ? "Database initialized with existing wedding content." : "Database ready; existing content preserved.");
  } catch (error) {
    console.error("Database initialization failed.", error instanceof Error && "code" in error ? String(error.code) : "Check database configuration and connectivity.");
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

void main();
