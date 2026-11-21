import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { expect, waitFor, within } from "storybook/test";

import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/routing";

import { CommandPalette } from "./CommandPalette";

const meta = {
  title: "Components/CommandPalette",
  component: CommandPalette,
  parameters: {
    // Uses the router (to go to pages) and the current path (to mark it)
    nextjs: { appDirectory: true, navigation: { pathname: "/en" } },
  },
} satisfies Meta<typeof CommandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

// The palette opens in a layer over the whole page (a "portal" in
// document.body), outside the story's canvas, so it's searched there
const page = () => within(document.body);

/** Closed: just the button, with Ctrl K (⌘K on a Mac). Click it or use the shortcut. */
export const Closed: Story = {
  play: async ({ canvas, globals }) => {
    const t = messages[globals.locale as Locale].commandPalette;
    const button = canvas.getByRole("button", { name: new RegExp(t.open) });
    await expect(button).toBeVisible();
    // The shortcut is written on the button and told to screen readers
    await expect(button).toHaveTextContent(/Ctrl\s*K|⌘\s*K/);
    await expect(button).toHaveAttribute("aria-keyshortcuts");
  },
};

/** Open: every page and action, ready to search. */
export const Open: Story = {
  args: { defaultOpen: true },
  play: async ({ globals }) => {
    const t = messages[globals.locale as Locale];

    const dialog = await page().findByRole("dialog", {
      name: t.commandPalette.title,
    });
    const inDialog = within(dialog);
    // The dialog fades in from opacity 0 (100 ms): wait until it's shown,
    // or a fast machine (like the CI) checks too early
    await waitFor(() =>
      expect(inDialog.getByRole("option", { name: new RegExp(t.nav.home) })).toBeVisible(),
    );
    for (const id of ["home", "projects", "about", "wishlist"] as const) {
      await expect(
        inDialog.getByRole("option", { name: new RegExp(t.nav[id]) }),
      ).toBeVisible();
    }
    await expect(
      inDialog.getByRole("option", { name: t.commandPalette.dark }),
    ).toBeVisible();
    await expect(
      inDialog.getByRole("option", { name: t.footer.contacts.github }),
    ).toBeVisible();
  },
};

const fakeMac = { userAgentData: { platform: "macOS" }, platform: "MacIntel" };

/** On a Mac the button shows ⌘ instead of Ctrl (the system is faked here). */
export const OnAMac: Story = {
  beforeEach: () => {
    for (const [key, value] of Object.entries(fakeMac)) {
      Object.defineProperty(navigator, key, { value, configurable: true });
    }
    // Undo the fake when the story closes
    return () => {
      for (const key of Object.keys(fakeMac)) {
        delete (navigator as unknown as Record<string, unknown>)[key];
      }
    };
  },
  play: async ({ canvas, globals }) => {
    const t = messages[globals.locale as Locale].commandPalette;
    const button = canvas.getByRole("button", { name: new RegExp(t.open) });
    await expect(button).toHaveTextContent("⌘K");
    await expect(button).toHaveAttribute("aria-keyshortcuts", "Meta+K");
  },
};

// Interaction test: runs in `pnpm test`, hidden from the Storybook sidebar
// ("!dev") because it changes the state on its own.
export const ShortcutSearchAndGo: Story = {
  tags: ["!dev"],
  play: async ({ globals, userEvent }) => {
    const locale = globals.locale as Locale;
    const t = messages[locale];

    await userEvent.keyboard("{Control>}k{/Control}");
    const dialog = await page().findByRole("dialog", {
      name: t.commandPalette.title,
    });

    // The search box has the focus: typing filters the list
    await userEvent.keyboard(t.nav.projects.slice(0, 4));
    await waitFor(() =>
      expect(
        within(dialog).queryByRole("option", { name: t.nav.about }),
      ).not.toBeInTheDocument(),
    );

    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    // The router got the page, with the language prefix
    await expect(getRouter().push).toHaveBeenCalledWith(`/${locale}/projects`);
  },
};

// Interaction test: a command that only shows for its exact text (a made-up
// one here), and goes to its page with Enter
export const ExactTextCommand: Story = {
  tags: ["!dev"],
  args: {
    defaultOpen: true,
    commands: [
      {
        digest: "184858a00fd7971f810848266ebcecee5e8b69972c5ffaed622f5ee078671aed",
        target: "57090815131d1a0e09",
      },
    ],
  },
  play: async ({ globals, userEvent }) => {
    const locale = globals.locale as Locale;
    const t = messages[locale].commandPalette;
    const dialog = await page().findByRole("dialog", { name: t.title });
    const inDialog = within(dialog);

    await userEvent.keyboard("xyzz");
    await expect(await inDialog.findByText(t.empty)).toBeVisible();
    await expect(inDialog.queryByRole("option")).not.toBeInTheDocument();

    await userEvent.keyboard("y");
    await expect(await inDialog.findByRole("option", { name: "xyzzy" })).toBeVisible();

    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(getRouter().push).toHaveBeenCalledWith(`/${locale}/projects`);
  },
};
