import type { ContactLink, Place, PlaceId } from "@/core/types/profile";

const timeZones: Record<PlaceId, string> = {
  lisbon: "Europe/Lisbon",
  // One hour behind Lisbon
  pontaDelgada: "Atlantic/Azores",
  // One hour ahead of Lisbon
  amsterdam: "Europe/Amsterdam",
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
 * Every place on the footer's clock. To add a city: its id in `PlaceId`, its
 * time zone above, and its name in `footer.places` in both languages.
 *
 * @returns The places, starting with where I am right now.
 */
export function getPlaces(): Place[] {
  const current = getCurrentPlace();
  const others = (Object.keys(timeZones) as PlaceId[])
    .filter((id) => id !== current.id)
    .map((id) => ({ id, timeZone: timeZones[id] }));
  return [current, ...others];
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
