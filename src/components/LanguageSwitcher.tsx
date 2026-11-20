"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useLanguageSwitcher } from "@/hooks/useLanguageSwitcher";
import { Link } from "@/i18n/navigation";

/**
 * One button that shows the other language ("PT" on the English site, "EN"
 * on the Portuguese one) and opens the current page in it. The code slides
 * in when it changes.
 */
export function LanguageSwitcher() {
  const t = useTranslations("languageSwitcher");
  const { locale, languageTag, href } = useLanguageSwitcher();

  return (
    <nav aria-label={t("label")}>
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="size-10 rounded-full font-mono text-xs text-muted-foreground"
      >
        <Link
          href={href}
          locale={locale}
          lang={languageTag}
          hrefLang={languageTag}
          title={t(`languages.${locale}`)}
        >
          {/* `key` makes React redraw the code when the language changes,
              which replays the animation */}
          <span
            key={locale}
            className="animate-in duration-300 fade-in slide-in-from-bottom-1 motion-reduce:animate-none"
          >
            {t(`short.${locale}`)}
          </span>
          {/* Screen readers hear "PT Português": the visible code first
              (voice control users say what they see), then the full name */}
          <span className="sr-only"> {t(`languages.${locale}`)}</span>
        </Link>
      </Button>
    </nav>
  );
}
