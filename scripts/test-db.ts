import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { getDatabase } from "../lib/db";
import { readContent, writeContent } from "../lib/content-store";

async function main() {
  loadEnvConfig(process.cwd());
  const db = getDatabase();
  try {
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      const before = await readContent(client);
      const edited = structuredClone(before.content);
      edited.lodging.introduction = "Integration test — never published.";
      edited.thingsToDo.items.push({ id: "integration-test-activity", title: "A test walk", description: "A short walk", url: "https://example.com" });
      edited.schedule[0].events[0].title = "Integration test event";
      const saved = await writeContent(edited, before.revision, client);
      assert.ok(saved);
      assert.equal(saved.revision, before.revision + 1);
      assert.deepEqual((await readContent(client)).content, edited);
      assert.equal(await writeContent(before.content, before.revision, client), null, "Stale writes must be rejected");
      console.log("Database read/write and stale-revision checks passed. Test changes rolled back.");
    } finally {
      await client.query("ROLLBACK");
      client.release();
    }
  } catch {
    console.error("Database integration check failed. Check connectivity and database initialization.");
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

void main();
