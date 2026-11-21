/**
 * Who is asking for a private page:
 * - `admin`: signed in with the account that runs the site
 * - `denied`: signed in with any other account
 * - `anonymous`: not signed in
 */
export type AdminAccess = "admin" | "denied" | "anonymous";

/** Why a sign-in didn't finish. */
export type SignInError = "denied" | "failed";

/**
 * The part of a verified session token we read. `app_metadata` can only be
 * changed from the server side of Supabase; `user_metadata` can be edited by
 * the user, so it must never decide access.
 */
export interface SessionClaims {
  app_metadata?: { role?: unknown; [key: string]: unknown };
}
