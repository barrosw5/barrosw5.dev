"use client";

import { FolderGit2, Gift, House, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { type NavItemId, useSiteNav } from "@/hooks/useSiteNav";
import { useSlidingIndicator } from "@/hooks/useSlidingIndicator";
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
  const current = items.find((item) => item.isCurrent)?.id ?? "none";
  const { listRef, pillRef } = useSlidingIndicator<
    HTMLUListElement,
    HTMLSpanElement
  >(current);

  return (
    <nav
      aria-label={t("label")}
      // The full-width strip lets clicks through; only the pill catches them
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-gutter md:top-4 md:bottom-auto"
    >
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border bg-background/80 p-1 shadow-sm backdrop-blur-md">
        <ul
          ref={listRef}
          className="group/nav relative flex items-center gap-0.5 md:gap-1"
        >
          {/* The pill behind the current page, which slides to the page you
              go to. Hidden until placed (data-ready), animated after that
              (data-animate), still for reduced motion. */}
          <span
            ref={pillRef}
            aria-hidden
            className="absolute inset-y-0 left-0 rounded-full bg-muted opacity-0 group-data-animate/nav:transition-[transform,width] group-data-animate/nav:duration-300 group-data-animate/nav:ease-out group-data-ready/nav:opacity-100 motion-reduce:transition-none!"
          />
          {items.map(({ id, href, isCurrent }) => {
            const Icon = navIcons[id];
            return (
              <li key={id} className="relative">
                <Link
                  href={href}
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-full px-2.5 text-sm transition-colors duration-200 ease-out outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none md:px-4",
                    isCurrent
                      ? // Its own background only until the sliding pill is
                        // in place (before JavaScript runs)
                        "bg-muted text-foreground group-data-ready/nav:bg-transparent"
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
