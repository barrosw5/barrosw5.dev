import type {
  CertificateEntry,
  ContactLink,
  EducationEntry,
  ExperienceEntry,
  LocalizedText,
  Place,
  PlaceId,
  Profile,
  ProfileRow,
  StackItem,
} from "@/core/types/profile";

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

/**
 * What the site shows when the database can't be reached: the place and the
 * links it always had, and empty About content.
 *
 * @returns A complete profile.
 */
export function getFallbackProfile(): Profile {
  return {
    about: { en: "", pt: "" },
    doingNow: { en: "", pt: "" },
    currentPlace: getCurrentPlace().id,
    experience: [],
    stack: [],
    education: [],
    certificates: [],
    contacts: getContactLinks(),
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isText = (value: unknown): value is string => typeof value === "string";

const isLocalized = (value: unknown): value is LocalizedText =>
  isRecord(value) && isText(value.en) && isText(value.pt);

const isMonth = (value: unknown): value is string =>
  isText(value) && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);

// These links end up in an href, where `javascript:` would run code
function isSafeUrl(value: unknown): value is string {
  if (!isText(value)) return false;
  try {
    return ["https:", "mailto:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

const isPlaceId = (value: string): value is PlaceId =>
  Object.hasOwn(timeZones, value);

const isExperience = (value: unknown): value is ExperienceEntry =>
  isRecord(value) &&
  isText(value.id) &&
  isLocalized(value.title) &&
  isText(value.company) &&
  isMonth(value.startDate) &&
  (value.endDate === null || isMonth(value.endDate)) &&
  isLocalized(value.description);

const isStackItem = (value: unknown): value is StackItem =>
  isRecord(value) && isText(value.id) && isText(value.name);

const isEducation = (value: unknown): value is EducationEntry =>
  isRecord(value) &&
  isText(value.id) &&
  isLocalized(value.title) &&
  isText(value.school) &&
  isMonth(value.startDate) &&
  (value.endDate === null || isMonth(value.endDate)) &&
  isLocalized(value.description);

const isCertificate = (value: unknown): value is CertificateEntry =>
  isRecord(value) &&
  isText(value.id) &&
  isLocalized(value.name) &&
  isText(value.issuer) &&
  isMonth(value.issuedOn) &&
  (value.url === null || isSafeUrl(value.url));

const isContact = (value: unknown): value is ContactLink =>
  isRecord(value) &&
  (value.id === "github" || value.id === "linkedin") &&
  isSafeUrl(value.href);

const keepValid = <T>(value: unknown, isValid: (item: unknown) => item is T) =>
  Array.isArray(value) ? value.filter(isValid) : [];

/**
 * Turns the database row into the shape the site uses. Postgres doesn't check
 * what's inside the lists, so an entry that is malformed is left out instead
 * of breaking the page.
 *
 * @param row The row from `fetchProfileRow`.
 * @returns The profile, with only valid entries. It never throws.
 */
export function toProfile(row: ProfileRow): Profile {
  return {
    about: { en: row.about_en, pt: row.about_pt },
    doingNow: { en: row.doing_now_en, pt: row.doing_now_pt },
    currentPlace: isPlaceId(row.current_place)
      ? row.current_place
      : getCurrentPlace().id,
    experience: keepValid(row.experience, isExperience),
    stack: keepValid(row.stack, isStackItem),
    education: keepValid(row.education, isEducation),
    certificates: keepValid(row.certificates, isCertificate),
    contacts: keepValid(row.contacts, isContact),
  };
}
