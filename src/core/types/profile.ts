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
