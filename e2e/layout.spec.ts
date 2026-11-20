import { expect, test, text, visibleFooter } from "./fixtures";

const en = text("en");

test.describe("on desktop", () => {
  test.skip(({ isMobile }) => isMobile, "desktop layout");

  // docs/DESIGN.md: one screen at a time on desktop
  for (const path of ["/en", "/en/projects", "/en/about", "/en/wishlist"]) {
    test(`${path} fits the screen without scrolling`, async ({ page, open }) => {
      await open(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollHeight - window.innerHeight,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("the pill is at the top, the theme and language buttons in the corner", async ({
    page,
    open,
  }) => {
    await open("/en");
    const nav = page.getByRole("navigation", { name: en.nav.label });
    const box = await nav.locator("ul").boundingBox();
    expect(box!.y).toBeLessThan(100);

    const corner = page.getByRole("group", { name: en.nav.preferences });
    await expect(corner.getByRole("button", { name: en.theme.label })).toBeVisible();
    await expect(nav.getByRole("button", { name: en.theme.label })).toBeHidden();
  });
});

test.describe("on a phone", () => {
  test.skip(({ isMobile }) => !isMobile, "phone layout");

  test("the pill is at the bottom, with the theme and language buttons", async ({
    page,
    open,
  }) => {
    await open("/en");
    const nav = page.getByRole("navigation", { name: en.nav.label });
    const box = await nav.locator("ul").boundingBox();
    const height = page.viewportSize()!.height;
    expect(box!.y).toBeGreaterThan(height - 100);

    await expect(nav.getByRole("button", { name: en.theme.label })).toBeVisible();
    // Only the current page shows its name next to its icon. The others keep
    // theirs for screen readers in a 1×1 px box (sr-only), which counts as
    // "visible", so measure the width instead
    const width = async (name: string) =>
      (await nav.getByText(name).boundingBox())!.width;
    expect(await width(en.nav.home)).toBeGreaterThan(1);
    expect(await width(en.nav.projects)).toBeLessThanOrEqual(1);
  });
});

test.describe("the footer", () => {
  test("shows where I am and the local time", async ({ page, open }) => {
    await open("/en");
    const footer = visibleFooter(page);
    await expect(footer.getByText(en.footer.places.lisbon)).toBeVisible();
    await expect(footer.locator("time")).toHaveText(/^\d{2}:\d{2}$/);
  });

  test("opens my profiles in a new tab, safely", async ({ page, open }) => {
    await open("/en");
    for (const [id, href] of [
      ["github", "https://github.com/barrosw5"],
      ["linkedin", "https://www.linkedin.com/in/barrosw5-dev/"],
    ] as const) {
      const link = visibleFooter(page).getByRole("link", { name: new RegExp(en.footer.contacts[id]) });
      await expect(link).toHaveAttribute("href", href);
      await expect(link).toHaveAttribute("target", "_blank");
      // The new tab can't reach back into this page
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });
});
