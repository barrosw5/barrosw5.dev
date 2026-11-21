import type { Page } from "@playwright/test";

import { activeHeadlineReveal } from "../src/components/RevealHeadline";

import { expect, test, text, waitForHydration } from "./fixtures";

const en = text("en");
const pt = text("pt");
const sentence = (t: typeof en) =>
  `${t.welcome.title} ${t.welcome.description}`;

const headline = (page: Page, t: typeof en) =>
  page.getByRole("heading", { level: 1, name: sentence(t) });

/** The CSS animations running inside the visible headline. */
const headlineAnimations = (page: Page) =>
  page.evaluate(() => {
    const heading = [...document.querySelectorAll("h1")].find(
      (h) => h.offsetParent !== null,
    );
    return (heading?.getAnimations({ subtree: true }) ?? []).map(
      (a) => (a as CSSAnimation).animationName,
    );
  });

const done = (page: Page, t: typeof en) =>
  expect(headline(page, t)).toHaveAttribute("data-reveal-done", "", {
    timeout: 5000,
  });

test.describe("the home headline", () => {
  test("animates in, then is plain text", async ({ page }) => {
    await page.goto("/en");
    await expect
      .poll(() => headlineAnimations(page))
      .toContain(`reveal-${activeHeadlineReveal}`);

    await waitForHydration(page);
    await done(page, en);
    expect(await headlineAnimations(page)).toEqual([]);
  });

  test("doesn't play again when coming back to the page", async ({
    page,
    open,
  }) => {
    await open("/en");
    await done(page, en);

    const nav = page.getByRole("navigation", { name: en.nav.label });
    await nav.getByRole("link", { name: en.nav.projects }).click();
    await expect(page).toHaveURL("/en/projects");
    await nav.getByRole("link", { name: en.nav.home }).click();
    await expect(page).toHaveURL("/en");

    await expect(headline(page, en)).toBeVisible();
    expect(await headlineAnimations(page)).toEqual([]);
  });

  test("shows the new sentence when the language changes", async ({
    page,
    open,
  }) => {
    await open("/en");
    await page
      .getByRole("link", {
        name: `${en.languageSwitcher.short.pt} ${en.languageSwitcher.languages.pt}`,
      })
      .click();

    await expect(page).toHaveURL("/pt");
    await waitForHydration(page);
    await done(page, pt);
  });

  test("with reduced motion, is simply there", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en");
    await expect(headline(page, en)).toBeVisible();
    expect(await headlineAnimations(page)).toEqual([]);
  });

  test.describe("if the page's JavaScript never loads", () => {
    test.use({ allowConsoleErrors: true });

    test("still animates and ends in place", async ({ page }) => {
      await page.route("**/_next/static/**/*.js", (route) => route.abort());
      await page.goto("/en");

      // Every piece ends exactly inside its window, fully visible
      await expect
        .poll(
          () =>
            page.evaluate(() => {
              const items = [...document.querySelectorAll("[data-reveal-item]")];
              const finished = document
                .getAnimations()
                .every((a) => a.playState === "finished");
              const inPlace = items.every((item) => {
                const box = item.getBoundingClientRect();
                const mask = item.parentElement!.getBoundingClientRect();
                return box.top >= mask.top && box.bottom <= mask.bottom;
              });
              return items.length > 0 && finished && inPlace;
            }),
          { timeout: 5000 },
        )
        .toBe(true);
    });
  });
});
