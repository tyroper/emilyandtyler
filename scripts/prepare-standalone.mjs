import { access, cp } from "node:fs/promises";

const root = new URL("../", import.meta.url);

// Next.js traces server dependencies, but leaves public and generated assets out.
// Check for a completed build before packaging it for deployment.
await access(new URL(".next/standalone/server.js", root));
await access(new URL(".next/standalone/.next/BUILD_ID", root));
await cp(new URL("public/", root), new URL(".next/standalone/public/", root), { recursive: true });
await cp(new URL(".next/static/", root), new URL(".next/standalone/.next/static/", root), { recursive: true });
console.log("Standalone server and static assets are ready for deployment.");
