"use client";

import { FolderGit2, Gift, House, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { type NavItemId, useSiteNav } from "@/hooks/useSiteNav";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Page icons, also used by the command palette. */
export const navIcons: Record<NavItemId, typeof House> = {
  home: House,
  projects: FolderGit2,
  about: UserRound,
  wishlist: Gift,
};

/**
 * The floating navigation pill.
 *
 * Phone: at the bottom, within thumb reach. The pages are icons and only the
 * current one shows its name; the theme and language buttons are in the
 * pill too. Desktop (md and up): at the top, with the page names and no
 * icons; the theme and language buttons live in the corner (SiteHeader).
 */
export function SiteNav() {
  const t = useTranslations("nav");
  const items = useSiteNav();

  return (
    <nav
      aria-label={t("label")}
      // The full-width strip lets clicks through; only the pill catches them
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-gutter md:top-4 md:bottom-auto"
    >
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border bg-background/80 p-1 shadow-sm backdrop-blur-md">
        <ul className="flex items-center gap-0.5 md:gap-1">
          {items.map(({ id, href, isCurrent }) => {
            const Icon = navIcons[id];
            return (
              <li key={id}>
                <Link
                  href={href}
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-full px-2.5 text-sm transition-colors duration-200 ease-out outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none md:px-4",
                    isCurrent
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon aria-hidden className="size-4.5 md:hidden" />
                  {/* On the phone only the current page shows its name; the
                      others keep it for screen readers */}
                  <span className={cn(!isCurrent && "sr-only md:not-sr-only")}>
                    {t(id)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center border-l pl-1 md:hidden">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}
