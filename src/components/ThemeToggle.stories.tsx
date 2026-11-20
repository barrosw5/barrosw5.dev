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
// language; click the button yourself to see the animation.

/** Light mode: shows the moon, to switch to dark. */
export const Light: Story = {
  globals: { theme: "light" },
  play: async ({ canvas, globals }) => {
    const t = messages[globals.locale as Locale].theme;
    await expect(
      canvas.getByRole("button", { name: t.label }),
    ).toHaveAttribute("aria-pressed", "false");
    await expect(document.documentElement).not.toHaveClass("dark");
  },
};

/** Dark mode: shows the sun, to switch back to light. */
export const Dark: Story = {
  globals: { theme: "dark" },
  play: async ({ canvas, globals }) => {
    const t = messages[globals.locale as Locale].theme;
    await expect(
      canvas.getByRole("button", { name: t.label }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(document.documentElement).toHaveClass("dark");
  },
};

/** A first visit, before any click: follows your OS setting. */
export const FirstVisit: Story = {
  globals: { theme: "system" },
  play: async ({ canvas, globals }) => {
    const t = messages[globals.locale as Locale].theme;
    const osIsDark = matchMedia("(prefers-color-scheme: dark)").matches;
    await expect(
      canvas.getByRole("button", { name: t.label }),
    ).toHaveAttribute("aria-pressed", String(osIsDark));
  },
};

// Interaction test: runs in `pnpm test`, hidden from the Storybook sidebar
// ("!dev") because it changes the state on its own.
export const ClickingSwitchesAndSavesTheChoice: Story = {
  tags: ["!dev"],
  globals: { theme: "light" },
  play: async ({ canvas, globals, userEvent }) => {
    const t = messages[globals.locale as Locale].theme;
    const button = canvas.getByRole("button", { name: t.label });

    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(document.documentElement).toHaveClass("dark");
    await expect(localStorage.getItem("theme")).toBe("dark");

    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(document.documentElement).not.toHaveClass("dark");
    await expect(localStorage.getItem("theme")).toBe("light");
  },
};
