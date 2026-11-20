import { useLocale } from "next-intl";

import { usePathname } from "@/i18n/navigation";
import { languageTags, routing, type Locale } from "@/i18n/routing";

export interface LanguageTarget {
  /** The language the button switches to. */
  locale: Locale;
  /** BCP 47 tag for the `lang`/`hrefLang` attributes (e.g. `pt-PT`). */
  languageTag: string;
  /** Path of the current page, without the language prefix. */
  href: string;
}

/**
 * The language to switch to (the next one after the current), with a link to
 * the current page in that language.
 *
 * On `/en/wishlist` it returns `{ locale: "pt", href: "/wishlist" }`; the
 * `Link` from `@/i18n/navigation` adds the `/pt` prefix.
 */
export function useLanguageSwitcher(): LanguageTarget {
  const current = useLocale();
  const pathname = usePathname();

  const { locales } = routing;
  const locale = locales[(locales.indexOf(current) + 1) % locales.length];

  return { locale, languageTag: languageTags[locale], href: pathname };
}
