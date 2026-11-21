import { createContext, useContext } from "react";

import { getFallbackProfile } from "@/core/services/profileService";
import type { Profile } from "@/core/types/profile";

/**
 * Where the profile lives while a page is open. `SiteProfile` fills it once
 * for the whole site. Outside it (stories, the admin), the fallback applies.
 */
export const ProfileContext = createContext<Profile>(getFallbackProfile());

/** My profile, from any Client Component. */
export function useProfile(): Profile {
  return useContext(ProfileContext);
}
