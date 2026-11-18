import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { ADMIN_SESSION_SECONDS, createAdminToken, isAdminConfigured, verifyAdminCredentials, verifyAdminToken } from "../lib/admin-auth";

const originalUser = process.env.ADMIN_USER;
const originalPassword = process.env.ADMIN_PASSWORD;

beforeEach(() => {
  process.env.ADMIN_USER = "test-admin";
  process.env.ADMIN_PASSWORD = "a-long-random-test-password";
});

afterEach(() => {
  if (originalUser === undefined) delete process.env.ADMIN_USER;
  else process.env.ADMIN_USER = originalUser;
  if (originalPassword === undefined) delete process.env.ADMIN_PASSWORD;
  else process.env.ADMIN_PASSWORD = originalPassword;
});

test("only the exact configured credentials can sign in", () => {
  assert.equal(verifyAdminCredentials("test-admin", "a-long-random-test-password"), true);
  for (const [user, password] of [["wrong", process.env.ADMIN_PASSWORD], ["test-admin", "wrong"], [null, null], ["TEST-ADMIN", process.env.ADMIN_PASSWORD]]) {
    assert.equal(verifyAdminCredentials(user, password), false);
  }
});

test("missing or empty configuration fails closed, including existing sessions", () => {
  const token = createAdminToken();
  for (const variable of ["ADMIN_USER", "ADMIN_PASSWORD"]) {
    const saved = process.env[variable];
    for (const value of [undefined, ""]) {
      if (value === undefined) delete process.env[variable];
      else process.env[variable] = value;
      assert.equal(isAdminConfigured(), false);
      assert.equal(verifyAdminCredentials("", ""), false);
      assert.equal(verifyAdminToken(token), false);
      assert.throws(() => createAdminToken());
    }
    process.env[variable] = saved;
  }
});

test("sessions expire after eight hours and contain no credentials", () => {
  const now = 1_800_000_000_000;
  const token = createAdminToken(now);
  assert.equal(verifyAdminToken(token, now), true);
  assert.equal(verifyAdminToken(token, now + ADMIN_SESSION_SECONDS * 1000 - 1), true);
  assert.equal(verifyAdminToken(token, now + ADMIN_SESSION_SECONDS * 1000), false);
  assert.equal(token.includes(process.env.ADMIN_USER!), false);
  assert.equal(token.includes(process.env.ADMIN_PASSWORD!), false);
  assert.notEqual(createAdminToken(now), token);
});

test("forged, malformed, and altered cookies are rejected", () => {
  const token = createAdminToken();
  const parts = token.split(".");
  parts[1] = String(Number(parts[1]) + 60);
  for (const invalid of [undefined, "", "admin", "v1.0.fake.fake", `${token}.extra`, parts.join("."), `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`]) {
    assert.equal(verifyAdminToken(invalid), false);
  }
});

test("changing either credential invalidates existing sessions", () => {
  for (const variable of ["ADMIN_USER", "ADMIN_PASSWORD"]) {
    const token = createAdminToken();
    process.env[variable] += "-changed";
    assert.equal(verifyAdminToken(token), false);
    assert.equal(verifyAdminToken(createAdminToken()), true);
  }
});
