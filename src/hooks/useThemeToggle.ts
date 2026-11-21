import { useLayoutEffect, useSyncExternalStore } from "react";

import {
  resolvesToDark,
  restoreTheme,
  setThemeWithTransition,
  subscribeToTheme,
  type ThemeTransition,
} from "@/theme/theme";

export interface ThemeToggleState {
  /**
   * Whether the page is dark right now, or `null` while rendering on the
   * server (it only knows the visitor's OS and choice in the browser).
   */
  isDark: boolean | null;
  /** Switches to the other mode and saves the choice. */
  toggle: () => void;
}

/**
 * Reads and switches light/dark mode, and re-renders when it changes (also
 * from another tab or the OS). Until the visitor clicks, it follows the OS.
 *
 * @param transition The animation to play; by default, the site's.
 */
export function useThemeToggle(transition?: ThemeTransition): ThemeToggleState {
  // Switching language re-renders the root layout, and React then resets
  // <html> to the attributes in its JSX, wiping the `dark` class the head
  // script added. Put it back before the browser paints, without animating.
  useLayoutEffect(() => restoreTheme(), []);

  const isDark = useSyncExternalStore(
    subscribeToTheme,
    () => resolvesToDark(), // in the browser
    () => null, // on the server
  );

  return {
    isDark,
    toggle: () =>
      setThemeWithTransition(resolvesToDark() ? "light" : "dark", transition),
  };
}
