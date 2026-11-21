import { createSupabaseBrowserClient } from "./supabase/browserClient";

/**
 * Starts the GitHub sign-in: Supabase sends the browser to GitHub, and GitHub
 * sends it back to `redirectTo` with a one-time code.
 *
 * Calls `GET /auth/v1/authorize` (see docs/API.md).
 *
 * @param redirectTo Absolute URL of the callback; must be in Supabase's
 * allow-list of redirect URLs.
 * @returns Nothing: on success the browser leaves the page.
 * @throws {AuthError} If Supabase can't start the sign-in.
 * @throws {Error} If the environment variables are missing.
 */
export async function signInWithGitHub(redirectTo: string): Promise<void> {
  const { error } = await createSupabaseBrowserClient().auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo },
  });
  if (error) throw error;
}

/**
 * Ends the session and removes its cookies from this browser.
 *
 * Calls `POST /auth/v1/logout` (see docs/API.md).
 *
 * @returns Nothing.
 * @throws {AuthError} If Supabase can't end the session.
 * @throws {Error} If the environment variables are missing.
 */
export async function signOut(): Promise<void> {
  const { error } = await createSupabaseBrowserClient().auth.signOut();
  if (error) throw error;
}
