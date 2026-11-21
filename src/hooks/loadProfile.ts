import { getProfile } from "@/core/services/profileServerService";
import type { Profile } from "@/core/types/profile";

/**
 * Loads the profile on the server. Not a React hook (a Server Component has
 * no state), but it sits in this layer for the same reason as `requireAdmin`:
 * components reach services through here.
 *
 * @returns The profile. It never throws.
 */
export function loadProfile(): Promise<Profile> {
  return getProfile();
}
