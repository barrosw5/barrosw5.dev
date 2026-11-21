import {
  endServerSession,
  exchangeCodeForClaims,
  getSessionClaims,
} from "@/core/api/authServerApi";
import type { AdminAccess, SignInError } from "@/core/types/auth";

import { resolveAccess } from "./adminAccessService";

/**
 * Who the current request belongs to. Server only.
 *
 * @returns `admin`, `denied` or `anonymous`.
 * @throws {Error} If the environment variables are missing.
 */
export async function getAdminAccess(): Promise<AdminAccess> {
  return resolveAccess(await getSessionClaims());
}

/**
 * Finishes a sign-in when GitHub sends the visitor back. Any account other
 * than the admin's is signed out on the spot, so it keeps no session here.
 *
 * @param code The one-time code from the callback URL, if any.
 * @returns `null` when the admin is signed in, otherwise why it failed. It
 * never throws: every failure becomes `failed`.
 */
export async function completeSignIn(
  code: string | null,
): Promise<SignInError | null> {
  if (!code) return "failed";

  try {
    const claims = await exchangeCodeForClaims(code);
    if (resolveAccess(claims) === "admin") return null;

    await endServerSession();
    return "denied";
  } catch {
    return "failed";
  }
}
