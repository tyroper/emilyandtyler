"use server";

import { revalidatePath } from "next/cache";
import { saveSchema, type ContentSnapshot } from "../../lib/content-schema";
import { writeContent } from "../../lib/content-store";
import { isAdminAuthenticated } from "../../lib/admin-session";

export type SaveResult = { ok: true; snapshot: ContentSnapshot } | { ok: false; message: string };

export async function saveWeddingContent(input: unknown): Promise<SaveResult> {
  if (!await isAdminAuthenticated()) {
    return { ok: false, message: "Your session has expired. Sign in again in another tab, then retry saving your edits." };
  }
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: `${issue.path.join(" → ")}: ${issue.message}` };
  }
  let saved: ContentSnapshot | null;
  try {
    saved = await writeContent(parsed.data.content, parsed.data.revision);
  } catch {
    return { ok: false, message: "We couldn’t save your changes. Your edits are still here; please try again." };
  }
  if (!saved) return { ok: false, message: "The site was updated in another tab. Copy any edits you want to keep, then reload this page before saving again." };
  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true, snapshot: saved };
}
