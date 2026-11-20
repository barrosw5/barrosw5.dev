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
