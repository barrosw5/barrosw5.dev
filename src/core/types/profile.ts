/** A place on the footer's clock, shown with its local time. */
export type PlaceId = "lisbon" | "pontaDelgada" | "amsterdam";

export interface Place {
  id: PlaceId;
  /** IANA time zone, e.g. `Europe/Lisbon`. */
  timeZone: string;
}

/** A profile link shown in the footer (and later in About). */
export interface ContactLink {
  id: "github" | "linkedin";
  href: string;
}

/** Text written in both of the site's languages. */
export interface LocalizedText {
  en: string;
  pt: string;
}

/** A job on the About page. */
export interface ExperienceEntry {
  id: string;
  title: LocalizedText;
  company: string;
  /** `YYYY-MM`. */
  startDate: string;
  /** `YYYY-MM`, or `null` if it's the present. */
  endDate: string | null;
  description: LocalizedText;
}

/** A technology on the About page. */
export interface StackItem {
  id: string;
  name: string;
}

/** A course or degree on the About page. */
export interface EducationEntry {
  id: string;
  title: LocalizedText;
  school: string;
  /** `YYYY-MM`. */
  startDate: string;
  /** `YYYY-MM`, or `null` if it's the present. */
  endDate: string | null;
  description: LocalizedText;
}

/** A certificate on the About page. */
export interface CertificateEntry {
  id: string;
  name: LocalizedText;
  issuer: string;
  /** `YYYY-MM`. */
  issuedOn: string;
  /** Where to verify it, if anywhere. */
  url: string | null;
}

/** Everything the site shows about me, ready to use. */
export interface Profile {
  about: LocalizedText;
  doingNow: LocalizedText;
  currentPlace: PlaceId;
  experience: ExperienceEntry[];
  stack: StackItem[];
  education: EducationEntry[];
  certificates: CertificateEntry[];
  contacts: ContactLink[];
}

/**
 * The `profile` row as the database returns it. The lists are `unknown`
 * because Postgres only guarantees they are lists, not what's inside them.
 */
export interface ProfileRow {
  about_en: string;
  about_pt: string;
  doing_now_en: string;
  doing_now_pt: string;
  current_place: string;
  experience: unknown;
  stack: unknown;
  education: unknown;
  certificates: unknown;
  contacts: unknown;
}
