import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

import { readProxySession } from "./core/api/supabase/proxyClient";
import {
  adminRedirect,
  isAdminPath,
  resolveAccess,
} from "./core/services/adminAccessService";
import { routing } from "./i18n/routing";

/**
 * Redirects requests without a language prefix (e.g. `/wishlist`) to the
 * visitor's language (`/pt/wishlist`), based on the browser language and a
 * cookie remembering the last choice.
 */
const handleLanguage = createMiddleware(routing);

/**
 * Runs before every page. Public pages only go through the language step, so
 * they never wait for Supabase. Private pages also get their session read and
 * renewed, and visitors without access are redirected. This is the first
 * check, not the only one: `requireAdmin()` repeats it next to the page.
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isAdminPath(pathname)) return handleLanguage(request);

  // Before handleLanguage, which forwards the request's (renewed) cookies
  const session = await readProxySession(request);
  const target = adminRedirect(pathname, resolveAccess(session.claims));
  const response = target
    ? NextResponse.redirect(new URL(target, request.url))
    : handleLanguage(request);

  session.applyTo(response);
  // A response with someone's session must never be stored by a CDN
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  // Everything except API routes, Next/Vercel internals and files with an
  // extension (favicon.ico, images...)
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
