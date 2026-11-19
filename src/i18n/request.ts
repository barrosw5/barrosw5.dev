import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";

import { routing } from "./routing";

/**
 * Loads the translations for the current request.
 *
 * The language comes from the `[locale]` segment of the URL, read with
 * `next/root-params` (works with `cacheComponents`, unlike reading headers).
 * Note: root params are not available in Server Actions or Route Handlers yet;
 * revisit this when the first one needs translations.
 */
export default getRequestConfig(async () => {
  const requested = await rootLocale();
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    // Fixed so dates look the same on the server (UTC on Vercel) and in the browser
    timeZone: "Europe/Lisbon",
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
