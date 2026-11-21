import { getLocale } from "next-intl/server";

import { getAdminAccess } from "@/core/services/adminSessionService";
import { redirect } from "@/i18n/navigation";

/**
 * The check next to every private page, on the server. Not a React hook (a
 * Server Component has no state), but it sits in this layer for the same
 * reason: components reach services through here.
 *
 * Layouts don't run again on every navigation, so `AdminGate` alone isn't
 * enough for data: anything that reads or changes private data (later phases)
 * calls this itself, right before doing it.
 *
 * @returns Nothing if the visitor is the admin; otherwise it redirects to
 * the login and never returns.
 */
export async function requireAdmin(): Promise<void> {
  const access = await getAdminAccess();
  if (access === "admin") return;

  redirect({
    href: access === "denied" ? "/admin/login?error=denied" : "/admin/login",
    locale: await getLocale(),
  });
}
