import { useLocale } from "next-intl";

import { usePathname } from "@/i18n/navigation";
import { languageTags, routing, type Locale } from "@/i18n/routing";

export interface LanguageOption {
  locale: Locale;
  /** BCP 47 tag for the `lang`/`hrefLang` attributes (e.g. `pt-PT`). */
  languageTag: string;
  /** Path of the current page, without the language prefix. */
  href: string;
  isCurrent: boolean;
}

/**
 * Lists every language with a link to the current page in that language.
 *
 * On `/pt/wishlist` it returns `href: "/wishlist"` for both options; the
 * `Link` from `@/i18n/navigation` adds the prefix of the `locale` it gets.
 */
export function useLanguageSwitcher(): LanguageOption[] {
  const currentLocale = useLocale();
  const pathname = usePathname();

  return routing.locales.map((locale) => ({
    locale,
    languageTag: languageTags[locale],
    href: pathname,
    isCurrent: locale === currentLocale,
  }));
}
