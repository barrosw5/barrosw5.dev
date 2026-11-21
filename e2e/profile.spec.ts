import { expect, test, text, visibleFooter } from "./fixtures";

const en = text("en");

// The addresses served by e2e/fake-supabase.mjs. They differ from the site's
// fallback links, so these tests fail if the database isn't really being read
const github = "https://github.com/e2e-profile";
const linkedin = "https://www.linkedin.com/in/e2e-profile/";

test.describe("the profile from the database", () => {
  test.skip(!!process.env.E2E_BASE_URL, "a deployed site has real data");

  test("the footer shows its links", async ({ page, open }) => {
    await open("/en");
    const footer = visibleFooter(page);

    await expect(
      footer.getByRole("link", { name: new RegExp(en.footer.contacts.github) }),
    ).toHaveAttribute("href", github);
    await expect(
      footer.getByRole("link", { name: new RegExp(en.footer.contacts.linkedin) }),
    ).toHaveAttribute("href", linkedin);
  });

  test("the command palette opens its links", async ({ page, open, isMobile }) => {
    test.skip(isMobile, "the palette's shortcut needs a keyboard");
    await open("/en");
    // Records the address instead of opening a real external site
    await page.evaluate(() => {
      window.open = (url) => {
        document.documentElement.dataset.opened = String(url);
        return null;
      };
    });

    await page.keyboard.press("Control+k");
    await page.getByRole("option", { name: en.footer.contacts.github }).click();

    await expect(page.locator("html")).toHaveAttribute("data-opened", github);
  });
});
