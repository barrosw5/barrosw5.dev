/** Where the Supabase project is and the key to talk to it. */
export interface SupabaseEnv {
  /** The project URL, e.g. `https://abcdefgh.supabase.co`. */
  url: string;
  /**
   * The publishable key (`sb_publishable_…`). Safe to show in the browser:
   * it only gets what Row Level Security allows.
   */
  publishableKey: string;
}

/**
 * Reads the Supabase settings from the environment variables (`.env.local`
 * locally, the project settings on Vercel).
 *
 * @returns The project URL and the publishable key.
 * @throws {Error} If a variable is missing, naming it, so a missing
 *   `.env.local` is obvious instead of a confusing network error.
 */
export function getSupabaseEnv(): SupabaseEnv {
  // Written out in full on purpose: Next.js swaps `process.env.NEXT_PUBLIC_…`
  // for its value when building the browser code, but only when it sees the
  // exact name (not process.env[name])
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const missing = [
    !url && "NEXT_PUBLIC_SUPABASE_URL",
    !publishableKey && "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  ].filter(Boolean);

  if (!url || !publishableKey) {
    throw new Error(
      `Missing ${missing.join(" and ")}. Copy .env.example to .env.local and fill it in (see docs/API.md).`,
    );
  }

  return { url, publishableKey };
}
