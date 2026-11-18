import "server-only";
import { Pool } from "pg";

const globalDatabase = globalThis as typeof globalThis & { weddingPool?: Pool };

export function getDatabase() {
  if (globalDatabase.weddingPool) return globalDatabase.weddingPool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured.");

  // A supplied CA enables full certificate verification. Otherwise honor the URL's SSL mode.
  const url = new URL(connectionString);
  const ca = process.env.DATABASE_CA_CERT?.replace(/\\n/g, "\n");
  if (ca) {
    for (const key of ["sslmode", "sslcert", "sslkey", "sslrootcert"]) url.searchParams.delete(key);
  } else if (url.searchParams.get("sslmode") === "require") {
    // Honor the supplied PostgreSQL SSL mode (encrypted connection, optional CA).
    url.searchParams.set("uselibpqcompat", "true");
  }
  const pool = new Pool({
    connectionString: url.toString(),
    ...(ca ? { ssl: { ca, rejectUnauthorized: true } } : {}),
    max: 5,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    statement_timeout: 10000,
  });
  // Do not expose connection strings or database error details in logs or responses.
  pool.on("error", () => console.error("An idle wedding database connection failed."));
  globalDatabase.weddingPool = pool;
  return pool;
}
