# Emily & Tyler

Next.js wedding site with a PostgreSQL-backed editor at `/admin`.

The repository root is the application root. Run all commands below from the directory containing `package.json`. Application routes are in `app/`, shared server code is in `lib/`, and static assets are in `public/`.

## Local development

1. Run `npm install`.
2. Copy the root `.env.example` to `.env.local` alongside `package.json` and set `DATABASE_URL` to the PostgreSQL connection string, plus `ADMIN_USER` and `ADMIN_PASSWORD` for admin sign-in. This file is ignored by Git. Never prefix these variables with `NEXT_PUBLIC_`.
3. Run `npm run db:init` to create `wedding_site_content` and seed the existing wedding itinerary. Initialization is safe to repeat and never overwrites existing content.
4. Run `npm run dev` and open `http://localhost:3000/admin`.

The database uses the connection string's TLS settings. For DigitalOcean clusters with a private CA, set `DATABASE_CA_CERT` to the cluster CA certificate (literal newlines or escaped `\n`); this enables certificate and hostname verification. If using only `sslmode=require`, the driver uses PostgreSQL/libpq-compatible encryption semantics.

## Editing

- Add, edit, remove, and reorder schedule days and events.
- Edit lodging and things-to-do introductions, then add recommendations with descriptions and optional website/booking links.
- **Save changes** publishes all three sections together. **Discard** restores the last saved content. The editor warns before navigating away with unsaved edits.
- Every save checks a revision number. If another tab saved first, the editor asks you to reload instead of overwriting their changes.

The public site reads the current database content on each request. When no database is configured, local development shows the original content. If a configured database fails, the site reports a loading error rather than displaying outdated content as if it were current.

## Access and deployment

The dashboard and its save action require sign-in with the server's `ADMIN_USER` and `ADMIN_PASSWORD`. Set both variables in `.env.local` for development and in the host's server environment for deployment. Use a long, randomly generated password. If either variable is empty or missing, admin access is disabled. No identity provider or additional session secret is needed.

Sign-in sets an eight-hour signed, HttpOnly, SameSite=Strict cookie scoped to `/admin`. Production cookies require HTTPS. Credentials remain on the server; the cookie contains only a signed expiry and random nonce. Changing either credential and restarting/redeploying invalidates existing sessions. **Sign out** clears the current browser's cookie.

Deploy to a Node.js host with access to PostgreSQL, configure `DATABASE_URL` (and optionally `DATABASE_CA_CERT`) in its server environment, and run `npm run db:init` once against that database. The database user needs table creation privileges for initialization and SELECT/UPDATE privileges at runtime. No database credentials are sent to the browser.

Set the host's root/working directory to the repository root (`.`). Install with `npm ci`, build with `npm run build`, and start with `npm start`. Next.js generates its production output in the root `.next/` directory and serves assets from the root `public/` directory.

## Checks

```sh
npm test
npx tsc --noEmit
npm run build
```

`npm run test:db` runs an integration check against the configured database inside a transaction that is always rolled back. It verifies reading, writing, and stale-revision protection without changing published content.
