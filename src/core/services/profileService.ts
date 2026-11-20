import type { ContactLink, Place, PlaceId } from "@/core/types/profile";

const timeZones: Record<PlaceId, string> = {
  lisbon: "Europe/Lisbon",
  // One hour behind Lisbon
  azores: "Atlantic/Azores",
};

/**
 * Where I am right now.
 *
 * For now a fixed value; in phase 2 it comes from the `profile` table, so it
 * can be changed in the admin (e.g. to the Azores during the holidays).
 *
 * @returns The place and its time zone.
 */
export function getCurrentPlace(): Place {
  const id: PlaceId = "lisbon";
  return { id, timeZone: timeZones[id] };
}

/**
 * My public profile links, in display order.
 *
 * For now fixed values; in phase 2 they come from the `profile` table. The
 * contact email is still to be decided (personal, an alias or a separate
 * address), so it isn't here yet.
 *
 * @returns The links, never empty.
 */
export function getContactLinks(): ContactLink[] {
  return [
    { id: "github", href: "https://github.com/barrosw5" },
    { id: "linkedin", href: "https://www.linkedin.com/in/barrosw5-dev/" },
  ];
}
