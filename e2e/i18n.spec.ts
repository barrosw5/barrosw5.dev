import { expect, languageTags, test, text, waitForHydration } from "./fixtures";

const en = text("en");

test.describe("choosing the language", () => {
  // The proxy (src/proxy.ts) reads the browser's Accept-Language header
  const cases = [
    { browser: "pt-PT", site: "pt" },
    { browser: "pt-BR", site: "pt" },
    { browser: "en-GB", site: "en" },
    { browser: "fr-FR", site: "en" }, // not offered: the default language
  ] as const;

  for (const { browser, site } of cases) {
    test.describe(`with a browser in ${browser}`, () => {
      test.use({ locale: browser });

      test(`opening the site goes to /${site}`, async ({ page }) => {
        await page.goto("/");
        await expect(page).toHaveURL(`/${site}`);
        await expect(page.locator("html")).toHaveAttribute(
          "lang",
          languageTags[site],
        );
      });
    });
  }
});

test.describe("the language button", () => {
  // "PT Português": the visible code, then the full name for screen readers
  const toPortuguese = `${en.languageSwitcher.short.pt} ${en.languageSwitcher.languages.pt}`;

  test("opens the same page in the other language", async ({ page, open }) => {
    await open("/en/projects");
    await page.getByRole("link", { name: toPortuguese }).click();

    await expect(page).toHaveURL("/pt/projects");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      text("pt").pageMessage.underConstruction.title,
    );
  });

  test("is remembered on the next visit", async ({ page, open }) => {
    await open("/en");
    await page.getByRole("link", { name: toPortuguese }).click();
    await expect(page).toHaveURL("/pt");
    await waitForHydration(page);

    // The browser still asks for English, but the saved choice wins
    await page.goto("/");
    await expect(page).toHaveURL("/pt");
  });
});
