import { cacheLife, cacheTag } from "next/cache";

import { fetchProfileRow } from "@/core/api/profileApi";
import type { Profile } from "@/core/types/profile";

import { getFallbackProfile, toProfile } from "./profileService";

/** The label on the cached profile: saving in the admin clears it. */
export const PROFILE_CACHE_TAG = "profile";

/**
 * The profile for the public site. Server only. The result is cached, so
 * visitors don't wait for the database.
 *
 * If the database fails, the site keeps working with the fallback profile,
 * which is cached for only a few minutes so it recovers by itself.
 *
 * @returns The profile. It never throws.
 */
export async function getProfile(): Promise<Profile> {
  "use cache";
  cacheTag(PROFILE_CACHE_TAG);

  try {
    const profile = toProfile(await fetchProfileRow());
    cacheLife("days");
    return profile;
  } catch (error) {
    console.error("Could not read the profile", error);
    cacheLife("minutes");
    return getFallbackProfile();
  }
}
