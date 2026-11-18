import "server-only";
import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_SECONDS = 8 * 60 * 60;

function credentials() {
  const user = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASSWORD;
  return user && password ? { user, password } : null;
}

export function isAdminConfigured() {
  return credentials() !== null;
}

function equal(a: string, b: string) {
  return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
}

export function verifyAdminCredentials(user: unknown, password: unknown) {
  const expected = credentials();
  if (!expected || typeof user !== "string" || typeof password !== "string") return false;
  const userMatches = equal(user, expected.user);
  const passwordMatches = equal(password, expected.password);
  return userMatches && passwordMatches;
}

let cachedKey: { user: string; password: string; key: Buffer } | undefined;

function signingKey() {
  const current = credentials();
  if (!current) return null;
  if (!cachedKey || cachedKey.user !== current.user || cachedKey.password !== current.password) {
    // Derive a separate signing key without requiring a third environment variable.
    cachedKey = { ...current, key: scryptSync(current.password, `wedding-admin-session:v1:${current.user}`, 32) };
  }
  return cachedKey.key;
}

export function createAdminToken(now = Date.now()) {
  const key = signingKey();
  if (!key) throw new Error("Admin authentication is not configured.");
  const expires = Math.floor(now / 1000) + ADMIN_SESSION_SECONDS;
  const payload = `v1.${expires}.${randomBytes(24).toString("hex")}`;
  const signature = createHmac("sha256", key).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function verifyAdminToken(token: string | undefined, now = Date.now()) {
  if (!token || !/^v1\.\d{10}\.[a-f0-9]{48}\.[a-f0-9]{64}$/.test(token)) return false;
  const key = signingKey();
  if (!key) return false;
  const [version, expires, nonce, signature] = token.split(".");
  const expected = createHmac("sha256", key).update(`${version}.${expires}.${nonce}`).digest("hex");
  if (!equal(signature, expected)) return false;
  const remaining = Number(expires) - Math.floor(now / 1000);
  return remaining > 0 && remaining <= ADMIN_SESSION_SECONDS;
}
