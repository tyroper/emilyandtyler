"use server";

import { redirect } from "next/navigation";
import { isAdminConfigured, verifyAdminCredentials } from "../../lib/admin-auth";
import { endAdminSession, startAdminSession } from "../../lib/admin-session";

export async function signIn(formData: FormData) {
  if (!isAdminConfigured()) redirect("/admin");
  if (!verifyAdminCredentials(formData.get("username"), formData.get("password"))) {
    redirect("/admin?error=credentials");
  }
  await startAdminSession();
  redirect("/admin");
}

export async function signOut() {
  await endAdminSession();
  redirect("/admin");
}
