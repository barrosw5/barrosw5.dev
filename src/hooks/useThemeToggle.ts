import { useSyncExternalStore } from "react";

import {
  getThemePreference,
  setThemePreference,
  subscribeToTheme,
  themePreferences,
  type ThemePreference,
} from "@/theme/theme";

export interface ThemeToggleState {
  /** All choices, in display order. */
  options: readonly ThemePreference[];
  /**
   * The current choice, or `null` while rendering on the server (it only
   * knows the visitor's choice once the page runs in the browser).
   */
  current: ThemePreference | null;
  select: (preference: ThemePreference) => void;
}

/**
 * Reads and changes the light/dark preference, and re-renders when it
 * changes (also from another tab or the OS).
 */
export function useThemeToggle(): ThemeToggleState {
  const current = useSyncExternalStore(
    subscribeToTheme,
    getThemePreference, // in the browser
    () => null, // on the server
  );

  return {
    options: themePreferences,
    current,
    select: setThemePreference,
  };
}
