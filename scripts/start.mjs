import { access } from "node:fs/promises";

const server = new URL("../.next/standalone/server.js", import.meta.url);
try {
  await access(server);
} catch {
  console.error("Production build is missing. Run npm run build during deployment before npm start.");
  process.exit(1);
}

// App Platform supplies PORT; bind all interfaces instead of the container hostname.
process.env.HOSTNAME = "0.0.0.0";
await import(server.href);
