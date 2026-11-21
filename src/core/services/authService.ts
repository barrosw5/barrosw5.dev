import { signInWithGitHub, signOut } from "@/core/api/authApi";
import type { Locale } from "@/i18n/routing";

/**
 * Sends the browser to GitHub to sign in, coming back to this site in the
 * same language. The language is part of the callback's path so that each
 * callback is one exact entry in Supabase's redirect allow-list.
 *
 * @param locale The language to come back in.
 * @param origin This site's origin, e.g. `https://barrosw5-dev.vercel.app`.
 * @returns Nothing: on success the browser leaves the page.
 * @throws {AuthError} If Supabase can't start the sign-in.
 * @throws {Error} If the environment variables are missing.
 */
export async function startAdminSignIn(
  locale: Locale,
  origin: string,
): Promise<void> {
  await signInWithGitHub(`${origin}/api/auth/callback/${locale}`);
}

/**
 * Ends the admin session in this browser.
 *
 * @returns Nothing.
 * @throws {AuthError} If Supabase can't end the session.
 * @throws {Error} If the environment variables are missing.
 */
export async function endAdminSession(): Promise<void> {
  await signOut();
}
