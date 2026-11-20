import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseEnv } from "./env";

/**
 * A Supabase client for code that runs on the server (Server Components,
 * Server Actions, Route Handlers). It reads the visitor's login session from
 * the request cookies. Create one per request: it belongs to that visitor.
 *
 * Reading cookies makes the page depend on the request, so with Cache
 * Components the part that uses it must be inside a `<Suspense>` boundary
 * (or the data cached with `"use cache"` when it's the same for everyone).
 *
 * @returns The Supabase client, using the publishable key.
 * @throws {Error} If the environment variables are missing (see `getSupabaseEnv`).
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabaseEnv();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components can't write cookies. That's fine: once there
          // is a login (roadmap phase 1), src/proxy.ts refreshes the session
          // on every request instead
        }
      },
    },
  });
}
