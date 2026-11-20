import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/routing";

import { ThemeToggle } from "./ThemeToggle";

const meta = {
  title: "Components/ThemeToggle",
  component: ThemeToggle,
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

// One story per state. Each `play` only checks the state, in the toolbar
// language; click the buttons yourself to try the others.

export const System: Story = {
  globals: { theme: "system" },
  play: async ({ canvas, globals }) => {
    const t = messages[globals.locale as Locale].theme;
    await expect(canvas.getByRole("group", { name: t.label })).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: t.system }),
    ).toHaveAttribute("aria-pressed", "true");
  },
};

export const Light: Story = {
  globals: { theme: "light" },
  play: async ({ canvas, globals }) => {
    const t = messages[globals.locale as Locale].theme;
    await expect(
      canvas.getByRole("button", { name: t.light }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(document.documentElement).not.toHaveClass("dark");
  },
};

export const Dark: Story = {
  globals: { theme: "dark" },
  play: async ({ canvas, globals }) => {
    const t = messages[globals.locale as Locale].theme;
    await expect(
      canvas.getByRole("button", { name: t.dark }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(document.documentElement).toHaveClass("dark");
  },
};

// Interaction test: runs in `pnpm test`, hidden from the Storybook sidebar
// ("!dev") because it changes the state on its own.
export const ClickingDarkSavesTheChoice: Story = {
  tags: ["!dev"],
  globals: { theme: "light" },
  play: async ({ canvas, globals, userEvent }) => {
    const t = messages[globals.locale as Locale].theme;
    const dark = canvas.getByRole("button", { name: t.dark });

    await userEvent.click(dark);

    await expect(dark).toHaveAttribute("aria-pressed", "true");
    await expect(
      canvas.getByRole("button", { name: t.light }),
    ).toHaveAttribute("aria-pressed", "false");
    await expect(document.documentElement).toHaveClass("dark");
    await expect(localStorage.getItem("theme")).toBe("dark");
  },
};
