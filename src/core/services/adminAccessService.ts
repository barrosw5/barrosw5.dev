import type { AdminAccess, SessionClaims } from "@/core/types/auth";
import { routing } from "@/i18n/routing";

const adminPath = new RegExp(`^/(${routing.locales.join("|")})/admin(/.*)?$`);

/**
 * Decides who a verified session belongs to. Only `app_metadata` counts:
 * users can't change it themselves.
 *
 * @param claims The session's verified claims, or `null` without a session.
 * @returns `admin`, `denied` (another account) or `anonymous`.
 */
export function resolveAccess(claims: SessionClaims | null): AdminAccess {
  if (!claims) return "anonymous";
  return claims.app_metadata?.role === "admin" ? "admin" : "denied";
}

/**
 * Whether an address is inside the private area.
 *
 * @param pathname The URL path, with its language prefix.
 * @returns True for `/en/admin`, `/pt/admin/...`; false for anything else.
 */
export function isAdminPath(pathname: string): boolean {
  return adminPath.test(pathname);
}

/**
 * Where a visitor must go instead of the private page they asked for.
 *
 * @param pathname The URL path, with its language prefix.
 * @param access Who is asking.
 * @returns The path to redirect to, or `null` to let the request through.
 */
export function adminRedirect(
  pathname: string,
  access: AdminAccess,
): string | null {
  const match = adminPath.exec(pathname);
  if (!match) return null;

  const home = `/${match[1]}/admin`;
  const login = `${home}/login`;

  if (pathname === login) return access === "admin" ? home : null;
  if (access === "admin") return null;
  return access === "denied" ? `${login}?error=denied` : login;
}
