import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

/**
 * Redirects requests without a language prefix (e.g. `/wishlist`) to the
 * visitor's language (`/pt-PT/wishlist`), based on the browser language and a
 * cookie remembering the last choice.
 */
export default createMiddleware(routing);

export const config = {
  // Everything except API routes, Next/Vercel internals and files with an
  // extension (favicon.ico, images...)
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
