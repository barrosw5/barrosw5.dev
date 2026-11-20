import { test as base, expect, type Page } from "@playwright/test";

import { messages } from "../src/i18n/messages";
import { languageTags, type Locale } from "../src/i18n/routing";

/**
 * Shared setup for every e2e test. Import `test` and `expect` from here, not
 * from "@playwright/test", to get:
 * - `open(path)`: goes to a page and waits until React has taken it over
 * - a check that fails the test if the page logs an error or crashes
 *   (turn it off for one test with `test.use({ allowConsoleErrors: true })`)
 *
 * Texts are never written in the tests: they come from the same JSON files
 * as the site, through `text(locale)`, so changing a translation doesn't
 * break a test.
 */

export { expect };
export { languageTags };
export type { Locale };

/** The site's translations for a language, e.g. `text("pt").nav.about`. */
export const text = (locale: Locale) => messages[locale];

/** "Projects · barrosw5.dev": how page titles are built (see the layout). */
export const pageTitle = (locale: Locale, name: string) =>
  `${name} · ${text(locale).metadata.title}`;

/**
 * The visible footer. Next keeps pages you navigated away from in the page,
 * hidden (`display: none`), so going back is instant and keeps their state
 * (node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md).
 * After switching language there are two footers: only one is shown.
 * (`getByRole` already skips hidden elements; CSS locators like this don't.)
 */
export const visibleFooter = (page: Page) =>
  page.locator("footer").filter({ visible: true });

/**
 * Waits until React has taken over the page ("hydration"). The footer's
 * local time is only drawn in the browser, so once it shows, the page's
 * JavaScript is running and buttons work.
 */
export async function waitForHydration(page: Page) {
  await expect(visibleFooter(page).locator("time")).toBeVisible();
}

// The 404 page answers with status 404 and the browser logs that as an
// error ("Failed to load resource ... 404"): expected, not a bug
const expectedErrors = [/status of 404/];

type Fixtures = {
  allowConsoleErrors: boolean;
  failOnConsoleErrors: void;
  open: (path: string) => Promise<void>;
};

export const test = base.extend<Fixtures>({
  allowConsoleErrors: [false, { option: true }],

  failOnConsoleErrors: [
    async ({ page, allowConsoleErrors }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() !== "error") return;
        const text = message.text();
        if (!expectedErrors.some((pattern) => pattern.test(text))) {
          errors.push(text);
        }
      });

      await use();

      if (!allowConsoleErrors) {
        expect(errors, "the page logged errors").toEqual([]);
      }
    },
    // Runs for every test without being asked for
    { auto: true },
  ],

  open: async ({ page }, use) => {
    await use(async (path) => {
      await page.goto(path);
      await waitForHydration(page);
    });
  },
});
