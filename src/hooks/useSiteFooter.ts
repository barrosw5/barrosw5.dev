import { getContactLinks, getCurrentPlace } from "@/core/services/profileService";
import type { ContactLink, Place } from "@/core/types/profile";

import { useNow } from "./useNow";

export interface SiteFooterData {
  /** Where I am, for the local time. */
  place: Place;
  /** Now, or `null` until the page runs in the browser. */
  now: Date | null;
  contacts: ContactLink[];
}

/** What the footer shows: my place and its time, and my profile links. */
export function useSiteFooter(): SiteFooterData {
  return {
    place: getCurrentPlace(),
    now: useNow(),
    contacts: getContactLinks(),
  };
}
