import type { Page } from "@playwright/test";

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

test.describe("the clock wheel", () => {
  const wheelOf = (page: Page) =>
    visibleFooter(page).getByRole("spinbutton", { name: en.footer.clock });
  const showsPlace = (name: string) => new RegExp(`^${name}, \\d{2}:\\d{2}$`);
  const { lisbon, pontaDelgada, amsterdam } = en.footer.places;

  test.describe("with a mouse and keyboard", () => {
    test.skip(({ isMobile }) => isMobile, "desktop only");

    test("hover shows the other places, scrolling turns it forever", async ({
      page,
      open,
    }) => {
      await open("/en");
      const wheel = wheelOf(page);
      await expect(wheel.getByText(pontaDelgada)).toHaveCount(0);

      await wheel.hover();
      await expect(wheel.getByText(pontaDelgada).first()).toBeVisible();

      await page.mouse.wheel(0, 100);
      await expect(wheel).toHaveAttribute("aria-valuetext", showsPlace(pontaDelgada));
      // Waits out the cooldown between steps
      await page.waitForTimeout(150);
      await page.mouse.wheel(0, 100);
      await expect(wheel).toHaveAttribute("aria-valuetext", showsPlace(amsterdam));
      // Past the last city, it wraps back to the start
      await page.waitForTimeout(150);
      await page.mouse.wheel(0, 100);
      await expect(wheel).toHaveAttribute("aria-valuetext", showsPlace(lisbon));
    });

    test("scrolling it doesn't scroll the page", async ({ page, open }) => {
      await page.setViewportSize({ width: 1280, height: 300 });
      await open("/en");
      await wheelOf(page).scrollIntoViewIfNeeded();
      await wheelOf(page).hover();
      await expect(wheelOf(page).getByText(pontaDelgada).first()).toBeVisible();
      // Two frames, so the browser has registered the open wheel's listener
      await page.evaluate(
        () =>
          new Promise((done) =>
            requestAnimationFrame(() => requestAnimationFrame(done)),
          ),
      );
      const before = await page.evaluate(() => window.scrollY);

      await page.mouse.wheel(0, -100);
      await expect(wheelOf(page)).toHaveAttribute(
        "aria-valuetext",
        showsPlace(amsterdam),
      );
      // Regression (WebKit on Linux): the page started a smooth scroll too.
      // Waits long enough for one to show before comparing
      await page.waitForTimeout(400);
      expect(await page.evaluate(() => window.scrollY)).toBe(before);
    });

    test("works with the keyboard alone", async ({ page, open }) => {
      await open("/en");
      const wheel = wheelOf(page);
      await wheel.focus();
      await page.keyboard.press("ArrowDown");
      await expect(wheel).toHaveAttribute("aria-valuetext", showsPlace(pontaDelgada));
      await page.keyboard.press("ArrowUp");
      await expect(wheel).toHaveAttribute("aria-valuetext", showsPlace(lisbon));
    });

    test("opening it moves nothing and adds no scroll", async ({ page, open }) => {
      await open("/en");
      const link = visibleFooter(page).getByRole("link", {
        name: new RegExp(en.footer.contacts.github),
      });
      const before = await link.boundingBox();
      await wheelOf(page).hover();
      await page.keyboard.press("ArrowDown");
      expect(await link.boundingBox()).toEqual(before);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollHeight - window.innerHeight,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  });

  test.describe("with a finger", () => {
    test.skip(({ isMobile }) => !isMobile, "phone only");

    // Playwright can only tap, so the drag is sent as touch events
    const touch = (
      page: Page,
      type: "touchstart" | "touchmove" | "touchend",
      y: number,
    ) =>
      wheelOf(page).evaluate(
        (element, { type, y }) => {
          const event = new Event(type, { bubbles: true, cancelable: true });
          const touches = type === "touchend" ? [] : [{ clientX: 50, clientY: y }];
          Object.defineProperty(event, "touches", { value: touches });
          element.dispatchEvent(event);
        },
        { type, y },
      );

    test("a tap opens it", async ({ page, open }) => {
      await open("/en");
      await wheelOf(page).tap();
      await expect(wheelOf(page).getByText(pontaDelgada).first()).toBeVisible();
    });

    // Regression: on the phone it opens over the profile links, which showed
    // through a see-through background
    test("its window hides what's behind it", async ({ page, open }) => {
      await open("/en");
      // Held down, so it can't close by itself during the check
      await touch(page, "touchstart", 300);
      const window = wheelOf(page).locator("> div");
      await expect
        .poll(() =>
          window.evaluate((element) => {
            const canvas = document.createElement("canvas").getContext("2d")!;
            canvas.fillStyle = getComputedStyle(element).backgroundColor;
            canvas.fillRect(0, 0, 1, 1);
            return canvas.getImageData(0, 0, 1, 1).data[3];
          }),
        )
        .toBe(255);
      await touch(page, "touchend", 300);
    });

    test("closes by itself a moment after the finger lets go", async ({
      page,
      open,
    }) => {
      await open("/en");
      const window = wheelOf(page).locator("> div");
      await touch(page, "touchstart", 300);
      await expect(window).not.toHaveClass(/pointer-events-none/);
      await touch(page, "touchmove", 276);

      // Still held after longer than the delay: it stays open
      await page.waitForTimeout(1500);
      await expect(window).not.toHaveClass(/pointer-events-none/);

      await touch(page, "touchend", 276);
      await expect(window).toHaveClass(/pointer-events-none/, { timeout: 3000 });
      // Closed on the city it was turned to
      await expect(wheelOf(page)).toHaveAttribute(
        "aria-valuetext",
        showsPlace(pontaDelgada),
      );
    });

    test("touching it again keeps it open", async ({ page, open }) => {
      await open("/en");
      const window = wheelOf(page).locator("> div");
      await touch(page, "touchstart", 300);
      await expect(window).not.toHaveClass(/pointer-events-none/);
      await touch(page, "touchmove", 290);
      await touch(page, "touchend", 290);

      await page.waitForTimeout(700);
      await touch(page, "touchstart", 300);
      await page.waitForTimeout(900);
      await expect(window).not.toHaveClass(/pointer-events-none/);
      await touch(page, "touchend", 300);
    });

    test("hold and drag turns it in one gesture", async ({ page, open }) => {
      await open("/en");
      await touch(page, "touchstart", 300);
      await expect(wheelOf(page).getByText(pontaDelgada).first()).toBeVisible();
      await touch(page, "touchmove", 276);
      await touch(page, "touchend", 276);
      await expect(wheelOf(page)).toHaveAttribute(
        "aria-valuetext",
        showsPlace(pontaDelgada),
      );
    });

    test("a quick swipe is left for the page to scroll", async ({ page, open }) => {
      await open("/en");
      await touch(page, "touchstart", 300);
      await touch(page, "touchmove", 200);
      await touch(page, "touchend", 200);
      await page.waitForTimeout(300);
      await expect(wheelOf(page)).toHaveAttribute("aria-valuetext", showsPlace(lisbon));
      await expect(wheelOf(page).getByText(pontaDelgada)).toHaveCount(0);
    });
  });
});

test.describe("the footer", () => {
  test("shows where I am and the local time", async ({ page, open }) => {
    await open("/en");
    const footer = visibleFooter(page);
    await expect(footer.getByText(en.footer.places.lisbon)).toBeVisible();
    await expect(footer.locator("time")).toHaveText(/^\d{2}:\d{2}$/);
  });

  test("a quick series on the last line opens the palette", async ({ page, open }) => {
    await open("/en");
    const line = visibleFooter(page).getByText(/©/);
    const dialog = page.getByRole("dialog", { name: en.commandPalette.title });
    for (let tap = 1; tap <= 4; tap++) await line.click();
    await expect(dialog).toBeHidden();
    await line.click();
    await expect(dialog).toBeVisible();
  });

  test("a slow series doesn't", async ({ page, open }) => {
    await open("/en");
    const line = visibleFooter(page).getByText(/©/);
    for (let tap = 1; tap <= 5; tap++) {
      await line.click();
      await page.waitForTimeout(750);
    }
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("opens my profiles in a new tab, safely", async ({ page, open }) => {
    await open("/en");
    // Only the site: the exact address comes from the database (profile.spec.ts)
    for (const [id, href] of [
      ["github", /^https:\/\/github\.com\//],
      ["linkedin", /^https:\/\/www\.linkedin\.com\/in\//],
    ] as const) {
      const link = visibleFooter(page).getByRole("link", { name: new RegExp(en.footer.contacts[id]) });
      await expect(link).toHaveAttribute("href", href);
      await expect(link).toHaveAttribute("target", "_blank");
      // The new tab can't reach back into this page
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });
});
