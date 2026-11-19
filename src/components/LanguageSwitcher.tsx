"use client";

import { useTranslations } from "next-intl";

import { useLanguageSwitcher } from "@/hooks/useLanguageSwitcher";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Links to the current page in each language. The current one is marked with
 * `aria-current` so screen readers announce it.
 */
export function LanguageSwitcher() {
  const t = useTranslations("languageSwitcher");
  const options = useLanguageSwitcher();

  return (
    <nav aria-label={t("label")}>
      <ul className="flex items-center gap-1 text-sm">
        {options.map(({ locale, languageTag, href, isCurrent }) => (
          <li key={locale}>
            <Link
              href={href}
              locale={locale}
              lang={languageTag}
              hrefLang={languageTag}
              aria-current={isCurrent ? "true" : undefined}
              className={cn(
                "rounded-md px-2 py-1 transition-colors hover:bg-muted",
                isCurrent
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {t(`languages.${locale}`)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
