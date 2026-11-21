import { getContactLinks, getPlaces } from "@/core/services/profileService";
import type { ContactLink, Place } from "@/core/types/profile";

import { openCommandPalette } from "./useCommandPalette";
import { useNow } from "./useNow";
import { useRepeatedTap } from "./useRepeatedTap";

export interface SiteFooterData {
  /** The places on the clock, starting with where I am. */
  places: Place[];
  /** Now, or `null` until the page runs in the browser. */
  now: Date | null;
  contacts: ContactLink[];
  onCopyrightTap: () => void;
}

/** What the footer shows: the places and their time, and my profile links. */
export function useSiteFooter(): SiteFooterData {
  return {
    places: getPlaces(),
    now: useNow(),
    contacts: getContactLinks(),
    onCopyrightTap: useRepeatedTap(5, openCommandPalette),
  };
}
