"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useThemeToggle } from "@/hooks/useThemeToggle";

// Both icons are always there, stacked; the `dark` class on <html> decides
// which one shows. CSS knows the theme before React loads (the script in
// <head> sets the class), so the right icon appears with no flash.
const icon =
  "size-4.5 transition-all duration-300 ease-out motion-reduce:transition-none";

/**
 * One button that switches between light and dark mode. It shows the moon
 * in light mode and the sun in dark mode, turning one into the other.
 * Screen readers hear "Dark mode, toggle button, pressed / not pressed".
 */
export function ThemeToggle() {
  const t = useTranslations("theme");
  const { isDark, toggle } = useThemeToggle();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      // Unknown on the server (null), so the attribute is only added in
      // the browser
      aria-pressed={isDark ?? undefined}
      aria-label={t("label")}
      title={t("label")}
      className="relative size-10 rounded-full text-muted-foreground"
    >
      <Moon
        aria-hidden
        className={`${icon} dark:-rotate-90 dark:scale-0 dark:opacity-0`}
      />
      <Sun
        aria-hidden
        className={`${icon} absolute rotate-90 scale-0 opacity-0 dark:rotate-0 dark:scale-100 dark:opacity-100`}
      />
    </Button>
  );
}
