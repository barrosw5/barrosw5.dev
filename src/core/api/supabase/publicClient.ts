import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "./env";

/**
 * A Supabase client for public data, the same for every visitor. Unlike the
 * server client it never reads cookies, which is what allows its results to
 * be cached with `"use cache"`.
 *
 * @returns The Supabase client, using the publishable key and no session.
 * @throws {Error} If the environment variables are missing (see `getSupabaseEnv`).
 */
export function createSupabasePublicClient() {
  const { url, publishableKey } = getSupabaseEnv();

  return createClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
