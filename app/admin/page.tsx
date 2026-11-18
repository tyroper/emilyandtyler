import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { readContent } from "../../lib/content-store";
import { AdminEditor } from "./admin-editor";
import { isAdminConfigured } from "../../lib/admin-auth";
import { isAdminAuthenticated } from "../../lib/admin-session";
import { signOut } from "./auth-actions";
import { LoginForm } from "./login-form";
import "./admin.css";

export const metadata: Metadata = {
  title: "Wedding admin | Emily & Tyler",
  robots: { index: false, follow: false },
};

type AdminPageProps = { searchParams: Promise<{ error?: string | string[] }> };

async function Dashboard({ searchParams }: AdminPageProps) {
  await connection();
  if (!isAdminConfigured()) {
    return <div className="admin-panel" role="alert"><h2>Admin sign-in is unavailable</h2><p>Please contact the site owner.</p></div>;
  }
  if (!await isAdminAuthenticated()) {
    return <LoginForm invalidCredentials={(await searchParams).error === "credentials"} />;
  }
  return <>
    <form action={signOut} className="admin-session"><button className="admin-button secondary" type="submit">Sign out</button></form>
    <Editor />
  </>;
}

async function Editor() {
  let snapshot;
  try { snapshot = await readContent(); }
  catch {
    return <div className="admin-panel" role="alert">
      <h2>We couldn’t load the dashboard</h2>
      <p>Check the server’s database connection and run <code>npm run db:init</code> if this is the first setup.</p>
      <a className="admin-button" href="/admin">Try again</a>
    </div>;
  }
  return <AdminEditor initial={snapshot} />;
}

export default function AdminPage({ searchParams }: AdminPageProps) {
  return <main className="admin-shell">
    <header className="admin-header">
      <div><p className="admin-eyebrow">Emily &amp; Tyler · November 7, 2027</p><h1>Wedding dashboard</h1><p>A little planning for a wonderful weekend.</p></div>
      <a className="admin-button secondary" href="/" target="_blank" rel="noreferrer">View wedding site ↗</a>
    </header>
    <Suspense fallback={<div className="admin-panel" role="status">Loading wedding details…</div>}><Dashboard searchParams={searchParams} /></Suspense>
  </main>;
}
