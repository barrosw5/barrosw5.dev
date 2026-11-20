import { expect, test, text } from "./fixtures";

const en = text("en");
const palette = en.commandPalette;

// A desktop feature: phones have the bottom pill instead
test.skip(({ isMobile }) => isMobile, "desktop only");

test.describe("the command palette", () => {
  test("its button shows the shortcut for this system", async ({ page, open }) => {
    await open("/en");
    const button = page.getByRole("button", { name: new RegExp(palette.open) });
    await expect(button).toHaveText(/Ctrl\s*K|⌘\s*K/);
    await expect(button).toHaveAttribute("aria-keyshortcuts", /^(Control|Meta)\+K$/);
  });

  test("opens with its button and closes with Esc", async ({ page, open }) => {
    await open("/en");
    await page.getByRole("button", { name: new RegExp(palette.open) }).click();
    const dialog = page.getByRole("dialog", { name: palette.title });
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("opens with the shortcut, filters as you type, Enter goes", async ({
    page,
    open,
  }) => {
    await open("/en");
    // ⌘K on a Mac, Ctrl+K elsewhere (beating the browser's own Ctrl+K)
    await page.keyboard.press("ControlOrMeta+k");
    const dialog = page.getByRole("dialog", { name: palette.title });
    await expect(dialog).toBeVisible();

    await page.keyboard.type(en.nav.about);
    await expect(dialog.getByRole("option", { name: en.nav.projects })).toBeHidden();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL("/en/about");
    await expect(dialog).toBeHidden();
  });

  test("switches the theme", async ({ page, open }) => {
    await open("/en");
    await page.keyboard.press("ControlOrMeta+k");
    await page.getByRole("option", { name: palette.dark }).click();
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  });

  test("switches the language, staying on the same page", async ({ page, open }) => {
    await open("/en/wishlist");
    await page.keyboard.press("ControlOrMeta+k");
    await page
      .getByRole("option", {
        name: palette.language.replace("{language}", en.languageSwitcher.languages.pt),
      })
      .click();
    await expect(page).toHaveURL("/pt/wishlist");
  });
});
