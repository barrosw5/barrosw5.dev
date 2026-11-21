import { useEffect, useState } from "react";

import { findUnlistedCommand } from "@/core/services/commandService";
import { getContactLinks } from "@/core/services/profileService";
import type { SealedCommand, UnlistedCommand } from "@/core/types/command";
import type { ContactLink } from "@/core/types/profile";
import { useRouter } from "@/i18n/navigation";

import { useIsMac } from "./useIsMac";
import { type LanguageTarget, useLanguageSwitcher } from "./useLanguageSwitcher";
import { type NavItem, useSiteNav } from "./useSiteNav";
import { useThemeToggle } from "./useThemeToggle";

export interface CommandPaletteState {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** What's typed in the search box. */
  search: string;
  setSearch: (search: string) => void;
  /** A command that only shows for this exact search, if any. */
  unlisted: UnlistedCommand | null;
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

const OPEN_EVENT = "command-palette:open";

/** Opens the palette from anywhere on the page. */
export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

/**
 * The command palette: opens and closes with ⌘K (Mac) or Ctrl+K (others),
 * and lists what can be done from it (go to a page, switch theme or
 * language, open a profile link).
 *
 * @param defaultOpen Start open (used by the Storybook story of that state).
 * @param commands Replaces the unlisted commands (used by stories).
 */
export function useCommandPalette(
  defaultOpen = false,
  commands?: SealedCommand[],
): CommandPaletteState {
  const [open, setOpenState] = useState(defaultOpen);
  const [search, setSearch] = useState("");
  const [found, setFound] = useState<UnlistedCommand | null>(null);
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
        setOpenState((isOpen) => !isOpen);
        setSearch("");
      }
    };
    const onOpenEvent = () => {
      setOpenState(true);
      setSearch("");
    };
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_EVENT, onOpenEvent);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_EVENT, onOpenEvent);
    };
  }, []);

  useEffect(() => {
    // The check is asynchronous: ignore the answer if the text changed since
    let isCurrent = true;
    void findUnlistedCommand(search, commands).then((command) => {
      if (isCurrent) setFound(command);
    });
    return () => {
      isCurrent = false;
    };
  }, [search, commands]);

  // Every time it opens or closes, the search starts empty again
  const setOpen = (next: boolean) => {
    setOpenState(next);
    setSearch("");
  };

  const closeThen = (action: () => void) => () => {
    setOpen(false);
    action();
  };

  return {
    open,
    setOpen,
    search,
    setSearch,
    // Compared with the search so a stale answer never shows
    unlisted: found?.text === search ? found : null,
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
