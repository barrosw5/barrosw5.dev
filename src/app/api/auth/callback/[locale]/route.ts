import { hasLocale } from "next-intl";
import { type NextRequest, NextResponse } from "next/server";

import { completeSignIn } from "@/core/services/adminSessionService";
import { routing } from "@/i18n/routing";

/**
 * Where GitHub's sign-in comes back to (documented in docs/API.md). The
 * destination is built here and never read from the URL, so this address
 * can't be used to redirect someone to another site.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale: requested } = await params;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const error = await completeSignIn(request.nextUrl.searchParams.get("code"));
  const path = error
    ? `/${locale}/admin/login?error=${error}`
    : `/${locale}/admin`;

  const response = NextResponse.redirect(new URL(path, request.url), 303);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
