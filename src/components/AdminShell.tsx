"use client";

import { ArrowUpRight, LayoutDashboard, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { type AdminNavId, useAdminShell } from "@/hooks/useAdminShell";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const icons: Record<AdminNavId, typeof LayoutDashboard> = {
  overview: LayoutDashboard,
};

/**
 * The admin's frame. Phone: a bar on top of the content. Desktop (md and up):
 * a sidebar that stays in place while the content scrolls.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const t = useTranslations("admin.nav");
  const tMeta = useTranslations("metadata");
  const { items, isSigningOut, signOutFailed, signOut } = useAdminShell();

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="flex flex-col gap-3 border-b border-sidebar-border bg-sidebar p-3 text-sidebar-foreground md:sticky md:top-0 md:h-dvh md:w-60 md:shrink-0 md:gap-6 md:border-r md:border-b-0 md:p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-xs">{tMeta("title")}</p>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>

        <nav aria-label={t("label")} className="md:flex-1">
          <ul className="flex flex-wrap gap-1 md:flex-col">
            {items.map(({ id, href, isCurrent }) => {
              const Icon = icons[id];
              return (
                <li key={id}>
                  <Link
                    href={href}
                    aria-current={isCurrent ? "page" : undefined}
                    className={cn(
                      "flex h-10 items-center gap-2 rounded-full px-3 text-sm transition-colors duration-200 ease-out outline-none focus-visible:ring-3 focus-visible:ring-sidebar-ring/50 motion-reduce:transition-none",
                      isCurrent
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:text-sidebar-foreground",
                    )}
                  >
                    <Icon aria-hidden className="size-4" />
                    {t(id)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex flex-wrap items-center gap-1 md:flex-col md:items-stretch">
          {signOutFailed && (
            <p role="alert" className="w-full px-3 text-xs text-destructive">
              {t("signOutFailed")}
            </p>
          )}
          <Button
            asChild
            variant="ghost"
            className="h-10 justify-start rounded-full px-3 text-muted-foreground"
          >
            <Link href="/">
              <ArrowUpRight aria-hidden />
              {t("viewSite")}
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="h-10 justify-start rounded-full px-3 text-muted-foreground"
            disabled={isSigningOut}
            onClick={signOut}
          >
            <LogOut aria-hidden />
            {isSigningOut ? t("signingOut") : t("signOut")}
          </Button>
        </div>
      </aside>

      <main id="content" className="flex min-w-0 flex-1 flex-col">
        {children}
      </main>
    </div>
  );
}
