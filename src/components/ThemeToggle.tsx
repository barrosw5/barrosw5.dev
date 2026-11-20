"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";

import { useThemeToggle } from "@/hooks/useThemeToggle";
import { cn } from "@/lib/utils";
import type { ThemePreference } from "@/theme/theme";

const icons: Record<ThemePreference, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

/**
 * Three buttons: light, dark and follow the system. The selected one has
 * `aria-pressed`, so screen readers announce it as "pressed".
 */
export function ThemeToggle() {
  const t = useTranslations("theme");
  const { options, current, select } = useThemeToggle();

  return (
    <div
      role="group"
      aria-label={t("label")}
      className="flex items-center gap-1 rounded-lg border p-0.5"
    >
      {options.map((option) => {
        const Icon = icons[option];
        const isSelected = option === current;
        return (
          <button
            key={option}
            type="button"
            onClick={() => select(option)}
            aria-pressed={isSelected}
            aria-label={t(option)}
            title={t(option)}
            className={cn(
              "rounded-md p-1.5 transition-colors hover:bg-muted",
              isSelected
                ? "bg-muted text-foreground"
                : "text-muted-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
