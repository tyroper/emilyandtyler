import assert from "node:assert/strict";
import test from "node:test";
import { contentSchema, saveSchema } from "../lib/content-schema";
import { defaultContent } from "../lib/default-content";

test("the original wedding content is valid", () => {
  assert.equal(contentSchema.safeParse(defaultContent).success, true);
});

test("recommendation links cannot execute scripts or use non-web protocols", () => {
  for (const url of ["javascript:alert(1)", "data:text/html,test", "file:///etc/passwd", "not-a-url"]) {
    const content = structuredClone(defaultContent);
    content.lodging.items.push({ id: "hotel", title: "Hotel", description: "", url });
    assert.equal(contentSchema.safeParse(content).success, false);
  }
  for (const url of ["", "https://example.com/booking?guests=2", "http://example.com"]) {
    const content = structuredClone(defaultContent);
    content.thingsToDo.items.push({ id: "activity", title: "Activity", description: "", url });
    assert.equal(contentSchema.safeParse(content).success, true);
  }
});

test("empty schedules, whitespace titles, oversized descriptions, and duplicate IDs are rejected", () => {
  assert.equal(contentSchema.safeParse({ ...defaultContent, schedule: [] }).success, false);
  const blank = structuredClone(defaultContent);
  blank.schedule[0].events[0].title = "   ";
  assert.equal(contentSchema.safeParse(blank).success, false);
  const oversized = structuredClone(defaultContent);
  oversized.lodging.introduction = "x".repeat(5001);
  assert.equal(contentSchema.safeParse(oversized).success, false);
  const duplicates = structuredClone(defaultContent);
  duplicates.schedule[1].id = duplicates.schedule[0].id;
  assert.equal(contentSchema.safeParse(duplicates).success, false);
});

test("writes require a positive integer revision and valid structured content", () => {
  for (const revision of [undefined, 0, -1, 1.5, "1"]) {
    assert.equal(saveSchema.safeParse({ content: defaultContent, revision }).success, false);
  }
  assert.equal(saveSchema.safeParse({ content: defaultContent, revision: 1 }).success, true);
  assert.equal(saveSchema.safeParse({ content: null, revision: 1 }).success, false);
});
