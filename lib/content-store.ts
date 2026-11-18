import "server-only";
import { contentSchema, type ContentSnapshot, type WeddingContent } from "./content-schema";
import { getDatabase } from "./db";
import type { Pool, PoolClient } from "pg";

type ContentRow = { content: unknown; revision: number; updated_at: Date };

function snapshot(row: ContentRow): ContentSnapshot {
  return { content: contentSchema.parse(row.content), revision: row.revision, updatedAt: row.updated_at.toISOString() };
}

export async function readContent(db: Pool | PoolClient = getDatabase()): Promise<ContentSnapshot> {
  const result = await db.query<ContentRow>(
    "SELECT content, revision, updated_at FROM wedding_site_content WHERE id = 1",
  );
  if (!result.rows[0]) throw new Error("Wedding content has not been initialized.");
  return snapshot(result.rows[0]);
}

export async function writeContent(content: WeddingContent, revision: number, db: Pool | PoolClient = getDatabase()): Promise<ContentSnapshot | null> {
  // The revision comparison and write are atomic, even across server instances.
  const result = await db.query<ContentRow>(
    `UPDATE wedding_site_content
     SET content = $1::jsonb, revision = revision + 1, updated_at = now()
     WHERE id = 1 AND revision = $2
     RETURNING content, revision, updated_at`,
    [JSON.stringify(contentSchema.parse(content)), revision],
  );
  return result.rows[0] ? snapshot(result.rows[0]) : null;
}
