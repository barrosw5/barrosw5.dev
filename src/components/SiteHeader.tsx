import { useTranslations } from "next-intl";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SiteNav } from "@/components/SiteNav";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * Everything at the edges of every page: a "skip to content" link for
 * keyboard users, the navigation pill, and (on desktop) the theme and
 * language buttons in the top right corner.
 */
export function SiteHeader() {
  const t = useTranslations("nav");

  return (
    <header>
      {/* Hidden until focused with Tab: lets keyboard users jump past the
          navigation straight to the page (the <main id="content">) */}
      <a
        href="#content"
        className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground focus:not-sr-only focus:fixed focus:top-4 focus:left-gutter"
      >
        {t("skip")}
      </a>
      <SiteNav />
      <div
        role="group"
        aria-label={t("preferences")}
        className="fixed top-5 right-gutter z-50 hidden items-center gap-1 md:flex"
      >
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
    </header>
  );
}
