import { connection } from "next/server";

import type { SessionClaims } from "@/core/types/auth";

import { createSupabaseServerClient } from "./supabase/serverClient";

/**
 * Trades GitHub's one-time code for a session, saved in cookies, and reads
 * its verified token.
 *
 * Calls `POST /auth/v1/token?grant_type=pkce` (see docs/API.md).
 *
 * @param code The `code` query parameter the callback received.
 * @returns The claims of the new session, or `null` if they can't be verified.
 * @throws {AuthError} If the code is invalid, expired or already used.
 * @throws {Error} If the environment variables are missing.
 */
export async function exchangeCodeForClaims(
  code: string,
): Promise<SessionClaims | null> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw error;

  const { data, error: claimsError } = await supabase.auth.getClaims();
  return claimsError ? null : (data?.claims ?? null);
}

/**
 * Reads the verified token of the current request's session. `getClaims`
 * checks the token's signature, so a forged cookie gives `null`.
 *
 * @returns The claims, or `null` without a valid session.
 * @throws {Error} If the environment variables are missing.
 */
export async function getSessionClaims(): Promise<SessionClaims | null> {
  // Checking a token reads the clock, which Next refuses while prerendering.
  // A session only exists in a real request, so wait for one
  await connection();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  return error ? null : (data?.claims ?? null);
}

/**
 * Ends the current request's session and clears its cookies.
 *
 * Calls `POST /auth/v1/logout?scope=local` (see docs/API.md).
 *
 * @returns Nothing.
 * @throws {AuthError} If Supabase can't end the session.
 * @throws {Error} If the environment variables are missing.
 */
export async function endServerSession(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) throw error;
}
