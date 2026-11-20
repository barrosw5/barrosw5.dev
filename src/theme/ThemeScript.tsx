"use client";

import { themeScript } from "./theme";

/**
 * Runs `themeScript` in <head> while the browser reads the HTML, so the right
 * theme is on before the first paint.
 *
 * The script only needs to run once, on a full page load. When React draws
 * the <head> again in the browser (switching language re-renders the whole
 * layout), it warns about <script> tags, so there the tag gets
 * `type="text/plain"`: the browser treats it as text and doesn't run it.
 * `suppressHydrationWarning` accepts that difference between server and
 * browser. It's a Client Component so this check also runs in the browser
 * (in a Server Component `window` would always be undefined). See node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md.
 */
export function ThemeScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: themeScript }}
    />
  );
}
