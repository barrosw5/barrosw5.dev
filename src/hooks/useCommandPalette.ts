import { useEffect, useState } from "react";

import { getContactLinks } from "@/core/services/profileService";
import type { ContactLink } from "@/core/types/profile";
import { useRouter } from "@/i18n/navigation";

import { useIsMac } from "./useIsMac";
import { type LanguageTarget, useLanguageSwitcher } from "./useLanguageSwitcher";
import { type NavItem, useSiteNav } from "./useSiteNav";
import { useThemeToggle } from "./useThemeToggle";

export interface CommandPaletteState {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Whether to show ⌘ (Mac) or Ctrl; `null` until known (server). */
  isMac: boolean | null;
  pages: NavItem[];
  isDark: boolean | null;
  /** The language the "switch language" command goes to. */
  language: LanguageTarget;
  contacts: ContactLink[];
  // Each command closes the palette, then does its job
  goTo: (href: string) => void;
  toggleTheme: () => void;
  switchLanguage: () => void;
  openLink: (href: string) => void;
}

/**
 * The command palette: opens and closes with ⌘K (Mac) or Ctrl+K (others),
 * and lists what can be done from it (go to a page, switch theme or
 * language, open a profile link).
 *
 * @param defaultOpen Start open (used by the Storybook story of that state).
 */
export function useCommandPalette(defaultOpen = false): CommandPaletteState {
  const [open, setOpen] = useState(defaultOpen);
  const router = useRouter();
  const isMac = useIsMac();
  const pages = useSiteNav();
  const { isDark, toggle } = useThemeToggle();
  const language = useLanguageSwitcher();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Accept both ⌘ and Ctrl: a Mac user may press Ctrl out of habit
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        // Otherwise the browser does its own thing (Ctrl+K = search bar)
        event.preventDefault();
        setOpen((isOpen) => !isOpen);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const closeThen = (action: () => void) => () => {
    setOpen(false);
    action();
  };

  return {
    open,
    setOpen,
    isMac,
    pages,
    isDark,
    language,
    contacts: getContactLinks(),
    goTo: (href) => closeThen(() => router.push(href))(),
    toggleTheme: closeThen(toggle),
    switchLanguage: closeThen(() =>
      router.replace(language.href, { locale: language.locale }),
    ),
    openLink: (href) =>
      closeThen(() => window.open(href, "_blank", "noopener,noreferrer"))(),
  };
}
