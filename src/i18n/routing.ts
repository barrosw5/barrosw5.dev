import { defineRouting } from "next-intl/routing";

/**
 * Supported languages and how they appear in the URL.
 *
 * Every page lives under a language prefix (`/en/...`, `/pt-PT/...`).
 * A visitor without a prefix is redirected by `src/proxy.ts`, based on the
 * browser language, falling back to `defaultLocale`.
 */
export const routing = defineRouting({
  locales: ["en", "pt-PT"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
