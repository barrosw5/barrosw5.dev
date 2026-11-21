import type { Page } from "@playwright/test";

import { activeThemeTransition } from "../src/theme/theme";

import { expect, test, text, waitForHydration } from "./fixtures";

const en = text("en");
const toPortuguese = `${en.languageSwitcher.short.pt} ${en.languageSwitcher.languages.pt}`;
const toEnglish = `${text("pt").languageSwitcher.short.en} ${text("pt").languageSwitcher.languages.en}`;

test.describe("the first visit follows the system theme", () => {
  for (const scheme of ["light", "dark"] as const) {
    test.describe(`on a ${scheme} system`, () => {
      test.use({ colorScheme: scheme });

      test(`the site is ${scheme}`, async ({ page, open }) => {
        await open("/en");
        const html = page.locator("html");
        if (scheme === "dark") await expect(html).toHaveClass(/\bdark\b/);
        else await expect(html).not.toHaveClass(/\bdark\b/);

        await expect(
          page.getByRole("button", { name: en.theme.label }),
        ).toHaveAttribute("aria-pressed", String(scheme === "dark"));
      });
    });
  }
});

test.describe("before the page's JavaScript runs", () => {
  test.use({ colorScheme: "dark", allowConsoleErrors: true });

  test("the theme is already right (no flash of light)", async ({ page }) => {
    // Block every script file: only the inline script in <head> can run.
    // (The blocked files log errors, hence allowConsoleErrors.)
    await page.route("**/_next/static/**/*.js", (route) => route.abort());
    await page.goto("/en");
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  });
});

test.describe("the theme button", () => {
  test("switches the theme and remembers it", async ({ page, open }) => {
    await open("/en");
    const button = page.getByRole("button", { name: en.theme.label });

    await button.click();
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
    await expect(button).toHaveAttribute("aria-pressed", "true");

    await page.reload();
    await waitForHydration(page);
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
    await expect(button).toHaveAttribute("aria-pressed", "true");
  });

  // Regression test: spamming the button used to flash between light and dark
  test("ignores clicks until the animation ends", async ({ page, open }) => {
    await open("/en");
    const html = page.locator("html");
    const button = page.getByRole("button", { name: en.theme.label });

    await button.click();
    // Hold the animation still, so the clicks below are surely in the middle
    await page.waitForFunction(() =>
      document
        .getAnimations()
        .some((a) => (a as CSSAnimation).animationName?.startsWith("theme-")),
    );
    await page.evaluate(() => {
      for (const animation of document.getAnimations()) animation.pause();
    });

    // One at a time, with a pause: the theme changes a frame after a click, so
    // clicks in a row could cancel each other out and hide a real problem
    for (let i = 0; i < 3; i++) {
      await button.evaluate((el) => (el as HTMLElement).click());
      await page.waitForTimeout(150);
      expect(
        await page.evaluate(() => ({
          dark: document.documentElement.classList.contains("dark"),
          saved: localStorage.getItem("theme"),
        })),
      ).toEqual({ dark: true, saved: "dark" });
    }

    // Once it ends, the animation cleans up and the button works again
    await page.evaluate(() => {
      for (const animation of document.getAnimations()) animation.finish();
    });
    await expect(html).not.toHaveAttribute("data-theme-transition");
    await button.click();
    await expect(html).not.toHaveClass(/\bdark\b/);
    await expect(button).toHaveAttribute("aria-pressed", "false");
  });
});

test.describe("the theme transition", () => {
  // The name of the CSS animation that reveals the new theme
  const revealAnimation = async (page: Page) => {
    const handle = await page.waitForFunction(() =>
      document
        .getAnimations()
        .map((animation) => (animation as CSSAnimation).animationName)
        .find((name) => name?.startsWith("theme-") && name !== "theme-crt-off"),
    );
    return handle.jsonValue();
  };

  test("plays the site's animation", async ({ page, open }) => {
    await open("/en");
    await page.getByRole("button", { name: en.theme.label }).click();
    expect(await revealAnimation(page)).toBe(
      activeThemeTransition === "split" ? "theme-split-open" : "theme-crt-on",
    );
  });

  test.describe("with reduced motion", () => {
    test("only fades, nothing moves", async ({ page, open }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await open("/en");
      await page.getByRole("button", { name: en.theme.label }).click();
      expect(await revealAnimation(page)).toBe("theme-fade");
    });
  });
});

// Two bugs found by hand while building the site: switching language redraws
// the whole page, which once wiped the theme and once made the theme icon
// replay its animation
test.describe("switching language in dark mode", () => {
  test.use({ colorScheme: "dark" });

  test("keeps the theme, without animating the theme icon", async ({
    page,
    open,
  }) => {
    // Count the CSS transitions that start inside the theme button
    await page.addInitScript(() => {
      const w = window as unknown as { themeIconTransitions: number };
      w.themeIconTransitions = 0;
      document.addEventListener(
        "transitionstart",
        (event) => {
          const target = event.target as Element;
          if (target.closest("button[aria-pressed]")) w.themeIconTransitions++;
        },
        true,
      );
    });

    await open("/en");
    for (const [link, path] of [
      [toPortuguese, "/pt"],
      [toEnglish, "/en"],
      [toPortuguese, "/pt"],
    ]) {
      await page.getByRole("link", { name: link }).click();
      await expect(page).toHaveURL(path);
      await waitForHydration(page);
      await expect(page.locator("html")).toHaveClass(/\bdark\b/);
    }

    const transitions = await page.evaluate(
      () => (window as unknown as { themeIconTransitions: number }).themeIconTransitions,
    );
    expect(transitions).toBe(0);
  });
});
