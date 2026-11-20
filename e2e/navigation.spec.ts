import { expect, pageTitle, test, text } from "./fixtures";

const en = text("en");
const nav = (page: import("@playwright/test").Page) =>
  page.getByRole("navigation", { name: en.nav.label });

test.describe("the navigation pill", () => {
  const pages = [
    { id: "projects", path: "/en/projects" },
    { id: "about", path: "/en/about" },
    { id: "wishlist", path: "/en/wishlist" },
    { id: "home", path: "/en" },
  ] as const;

  for (const { id, path } of pages) {
    test(`goes to ${en.nav[id]} and marks it as the current page`, async ({
      page,
      open,
    }) => {
      // Start somewhere else, so every link is really followed
      await open(id === "home" ? "/en/about" : "/en");
      const link = nav(page).getByRole("link", { name: en.nav[id] });
      await link.click();

      await expect(page).toHaveURL(path);
      await expect(link).toHaveAttribute("aria-current", "page");
      await expect(page).toHaveTitle(
        id === "home" ? en.metadata.title : pageTitle("en", en.nav[id]),
      );
    });
  }

  test("pages not built yet say so", async ({ page, open }) => {
    await open("/en/wishlist");
    const { title, description } = en.pageMessage.underConstruction;
    await expect(
      page.getByRole("heading", { level: 1, name: `${title} ${description}` }),
    ).toBeVisible();
  });

  test("its background slides under the current page", async ({ page, open }) => {
    await open("/en");
    await nav(page).getByRole("link", { name: en.nav.wishlist }).click();
    await expect(page).toHaveURL("/en/wishlist");

    // Once the slide ends, the pill sits exactly behind the current item
    const pill = nav(page).locator("ul > span");
    const current = nav(page).locator("li", {
      has: page.locator("[aria-current]"),
    });
    await expect(async () => {
      const [a, b] = await Promise.all([pill.boundingBox(), current.boundingBox()]);
      expect(Math.round(a!.x)).toBe(Math.round(b!.x));
      expect(Math.round(a!.width)).toBe(Math.round(b!.width));
    }).toPass();
  });
});

test.describe("an address that doesn't exist", () => {
  test("shows the 404 page, inside the site", async ({ page }) => {
    const response = await page.goto("/en/this-page-does-not-exist");
    expect(response?.status()).toBe(404);

    const { title, description } = en.pageMessage.notFound;
    await expect(
      page.getByRole("heading", { level: 1, name: `${title} ${description}` }),
    ).toBeVisible();
    await expect(page).toHaveTitle(pageTitle("en", en.metadata.notFound));
    // The navigation is still there
    await expect(nav(page)).toBeVisible();
  });

  test("without a language, gets one and then shows the 404", async ({ page }) => {
    const response = await page.goto("/nope");
    await expect(page).toHaveURL("/en/nope");
    expect(response?.status()).toBe(404);
  });

  test("has a way back home", async ({ page }) => {
    await page.goto("/en/nope");
    await page.getByRole("link", { name: en.pageMessage.back }).click();
    await expect(page).toHaveURL("/en");
  });
});

test.describe("keyboard", () => {
  test.skip(({ isMobile }) => isMobile, "phones have no Tab key");
  test.skip(
    ({ browserName }) => browserName === "webkit",
    "Safari only moves to links with Tab when a system setting is on",
  );

  test("the first Tab offers to skip to the content", async ({ page, open }) => {
    await open("/en/projects");

    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: en.nav.skip });
    await expect(skip).toBeFocused();

    // Enter jumps past the navigation: the next Tab is inside the page
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: en.pageMessage.back }),
    ).toBeFocused();
  });
});
