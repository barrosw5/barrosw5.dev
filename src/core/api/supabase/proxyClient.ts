import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

import type { SessionClaims } from "@/core/types/auth";

import { getSupabaseEnv } from "./env";

/** The session as `src/proxy.ts` sees it. */
export interface ProxySession {
  /** The verified token's claims, or `null` without a valid session. */
  claims: SessionClaims | null;
  /** Copies any renewed session cookies and their headers to the response. */
  applyTo: (response: NextResponse) => void;
}

/**
 * Reads and, if it expired, renews the session of a request in the proxy.
 *
 * Renewed cookies are written to the request too, so the page rendered after
 * the proxy sees the new token instead of trying to renew it a second time.
 * Call this before anything that forwards the request's headers.
 *
 * @param request The incoming request.
 * @returns The claims and a function to pass new cookies on to the response.
 * @throws {Error} If the environment variables are missing.
 */
export async function readProxySession(
  request: NextRequest,
): Promise<ProxySession> {
  const { url, publishableKey } = getSupabaseEnv();
  const renewed: Parameters<NextResponse["cookies"]["set"]>[] = [];
  const headers: Record<string, string> = {};

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, cacheHeaders) => {
        for (const { name, value, options } of cookiesToSet) {
          request.cookies.set(name, value);
          renewed.push([name, value, options]);
        }
        Object.assign(headers, cacheHeaders);
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();

  return {
    claims: error ? null : (data?.claims ?? null),
    applyTo: (response) => {
      for (const cookie of renewed) response.cookies.set(...cookie);
      for (const [name, value] of Object.entries(headers)) {
        response.headers.set(name, value);
      }
    },
  };
}
