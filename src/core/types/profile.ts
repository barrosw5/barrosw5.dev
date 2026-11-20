/** Where I am right now, shown with its local time in the footer. */
export type PlaceId = "lisbon" | "azores";

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
