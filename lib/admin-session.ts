import "server-only";
import { cookies } from "next/headers";
import { ADMIN_SESSION_SECONDS, createAdminToken, verifyAdminToken } from "./admin-auth";

const cookieName = "wedding_admin_session";
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/admin",
};

export async function isAdminAuthenticated() {
  return verifyAdminToken((await cookies()).get(cookieName)?.value);
}

export async function startAdminSession() {
  (await cookies()).set(cookieName, createAdminToken(), { ...cookieOptions, maxAge: ADMIN_SESSION_SECONDS });
}

export async function endAdminSession() {
  (await cookies()).set(cookieName, "", { ...cookieOptions, maxAge: 0 });
}
