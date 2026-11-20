import { languageTags, type Locale } from "@/i18n/routing";

/**
 * The time of day as hours and minutes (24 h), e.g. `14:32`, in the given
 * time zone and in the locale's format.
 */
export function formatTime(date: Date, locale: Locale, timeZone: string) {
  return new Intl.DateTimeFormat(languageTags[locale], {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).format(date);
}
