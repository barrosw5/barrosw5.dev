import { defineRouting } from "next-intl/routing";

/**
 * Supported languages and how they appear in the URL.
 *
 * Every page lives under a language prefix (`/en/...`, `/pt/...`).
 * A visitor without a prefix is redirected by `src/proxy.ts`, based on the
 * browser language, falling back to `defaultLocale`.
 */
export const routing = defineRouting({
  locales: ["en", "pt"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

/**
 * Full language tag for each locale, for `<html lang>` and `Intl` formatting.
 *
 * The URL uses the short `pt`, but our Portuguese is from Portugal: `pt-PT`
 * makes screen readers use the Portuguese accent and formats numbers and dates
 * the Portuguese way (plain `pt` means Brazilian conventions in `Intl`).
 */
export const languageTags: Record<Locale, string> = {
  en: "en",
  pt: "pt-PT",
};
