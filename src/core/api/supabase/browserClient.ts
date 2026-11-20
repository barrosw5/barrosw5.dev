import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv } from "./env";

/**
 * A Supabase client for code that runs in the browser (Client Components).
 * It keeps the login session in cookies, so the server can read the same
 * session. Calling it again returns the same client (no new connection).
 *
 * @returns The Supabase client, using the publishable key.
 * @throws {Error} If the environment variables are missing (see `getSupabaseEnv`).
 */
export function createSupabaseBrowserClient() {
  const { url, publishableKey } = getSupabaseEnv();
  return createBrowserClient(url, publishableKey);
}
