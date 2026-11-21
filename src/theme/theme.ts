/**
 * Light/dark mode.
 *
 * A first visit follows the OS setting ("system"). Once the visitor switches
 * to "light" or "dark", that choice is saved in localStorage and wins on the
 * next visits. The `dark` class on <html> switches the colours in globals.css.
 */

export const themePreferences = ["light", "dark", "system"] as const;
export type ThemePreference = (typeof themePreferences)[number];

const STORAGE_KEY = "theme";
const CHANGE_EVENT = "themechange";
const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * How the page changes when the visitor switches theme (the animations are in
 * globals.css):
 * - "split": a line opens from the middle of the screen, revealing the new
 *   theme while its brightness rises, so light mode is never a flashbang
 * - "crt": the page collapses into a line like an old TV turning off, then
 *   turns back on in the new theme
 */
export const themeTransitions = ["split", "crt"] as const;
export type ThemeTransition = (typeof themeTransitions)[number];

/** The one the site uses. Change this line to switch. */
export const activeThemeTransition: ThemeTransition = "split"; // or "crt"

function isThemePreference(value: unknown): value is ThemePreference {
  return themePreferences.includes(value as ThemePreference);
}

/** The saved choice, or "system" if there is none (or storage is blocked). */
export function getThemePreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isThemePreference(saved) ? saved : "system";
  } catch {
    return "system";
  }
}

/** True when the preference means dark: "dark", or "system" on a dark OS. */
export function resolvesToDark(preference = getThemePreference()) {
  return (
    preference === "dark" ||
    (preference === "system" && window.matchMedia(DARK_QUERY).matches)
  );
}

/** Puts the `dark` class on <html> when the preference resolves to dark. */
export function applyTheme(preference = getThemePreference()) {
  const isDark = resolvesToDark(preference);

  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  // Also switches native UI (scrollbars, form controls) to dark
  root.style.colorScheme = isDark ? "dark" : "light";
}

/**
 * Puts the theme back after React redraws <html> (switching language does
 * that and wipes the `dark` class), without animating anything: for a moment
 * the page was "light", and every CSS transition (the ThemeToggle icons,
 * colours) would otherwise play from light back to dark.
 */
export function restoreTheme() {
  const noTransitions = document.createElement("style");
  noTransitions.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.appendChild(noTransitions);

  applyTheme();

  // Make the browser compute the styles now, while transitions are off, so
  // any transition already started is cancelled at its end state
  void getComputedStyle(document.documentElement).color;
  // Turn transitions back on once those styles are in place
  setTimeout(() => noTransitions.remove(), 1);
}

function savePreference(preference: ThemePreference) {
  try {
    localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // Storage blocked (e.g. some private modes): still apply for this visit
  }
}

/** Applies the theme and tells subscribers it changed. */
function publishTheme(preference: ThemePreference) {
  applyTheme(preference);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Saves the choice, applies it and tells subscribers it changed. */
export function setThemePreference(preference: ThemePreference) {
  savePreference(preference);
  publishTheme(preference);
}

/** The animation running now, so an older one can't clean up after a newer one. */
let runningTransition: ViewTransition | null = null;

/**
 * Like `setThemePreference`, but animated with the View Transitions API: the
 * browser photographs the page, the theme changes, and the CSS in globals.css
 * animates from the photo to the live page. Browsers without the API just
 * change the theme.
 */
export function setThemeWithTransition(
  preference: ThemePreference,
  transition: ThemeTransition = activeThemeTransition,
) {
  if (!document.startViewTransition) {
    setThemePreference(preference);
    return;
  }

  // Saved now, not in the callback (which runs a frame later), so a quick
  // second click already sees this choice and switches back
  savePreference(preference);

  const root = document.documentElement;
  root.dataset.themeTransition = transition;

  const viewTransition = document.startViewTransition(() =>
    publishTheme(preference),
  );
  runningTransition = viewTransition;

  // Rejects when the animation is skipped (a second click, a hidden tab). The
  // theme still changes, so that isn't an error
  viewTransition.ready.catch(() => {});
  viewTransition.finished
    .catch(() => {})
    .finally(() => {
      if (runningTransition !== viewTransition) return;
      runningTransition = null;
      delete root.dataset.themeTransition;
    });
}

/**
 * Calls `onChange` whenever the preference may have changed: a choice in this
 * tab, a choice in another tab, or the OS switching between light and dark.
 * Returns a function that stops listening.
 */
export function subscribeToTheme(onChange: () => void) {
  const media = window.matchMedia(DARK_QUERY);

  const handleSystemChange = () => {
    if (getThemePreference() === "system") applyTheme("system");
    onChange();
  };
  const handleOtherTab = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    applyTheme();
    onChange();
  };

  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", handleOtherTab);
  media.addEventListener("change", handleSystemChange);

  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", handleOtherTab);
    media.removeEventListener("change", handleSystemChange);
  };
}

/**
 * Runs in <head> before the page is painted, so a dark-mode visitor never
 * sees a flash of the light theme. Same logic as `applyTheme`, written as a
 * plain string because it runs before any of our JavaScript has loaded.
 */
export const themeScript = `(() => {
  try {
    const saved = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
    const isDark = saved === "dark" ||
      (saved !== "light" && window.matchMedia(${JSON.stringify(DARK_QUERY)}).matches);
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  } catch {}
})();`;
