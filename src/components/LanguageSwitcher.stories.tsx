import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import en from "@/i18n/messages/en.json";
import pt from "@/i18n/messages/pt.json";

import { LanguageSwitcher } from "./LanguageSwitcher";

const { languages } = en.languageSwitcher;

const meta = {
  title: "Components/LanguageSwitcher",
  component: LanguageSwitcher,
  parameters: {
    nextjs: {
      // The component uses next/navigation (through next-intl), which needs
      // Storybook's App Router mock. Pretend we are on the wishlist page.
      appDirectory: true,
      navigation: { pathname: "/en/wishlist" },
    },
  },
} satisfies Meta<typeof LanguageSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const English: Story = {
  globals: { locale: "en" },
  play: async ({ canvas }) => {
    // The nav is labelled in the current language
    await expect(
      canvas.getByRole("navigation", { name: en.languageSwitcher.label }),
    ).toBeVisible();

    // Each link points to the same page in its language
    const english = canvas.getByRole("link", { name: languages.en });
    const portuguese = canvas.getByRole("link", { name: languages.pt });
    await expect(english).toHaveAttribute("href", "/en/wishlist");
    await expect(portuguese).toHaveAttribute("href", "/pt/wishlist");

    // Only the current language is marked as current
    await expect(english).toHaveAttribute("aria-current", "true");
    await expect(portuguese).not.toHaveAttribute("aria-current");
  },
};

export const Portuguese: Story = {
  globals: { locale: "pt" },
  parameters: {
    nextjs: { navigation: { pathname: "/pt/wishlist" } },
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("navigation", { name: pt.languageSwitcher.label }),
    ).toBeVisible();

    await expect(
      canvas.getByRole("link", { name: languages.pt }),
    ).toHaveAttribute("aria-current", "true");
    await expect(
      canvas.getByRole("link", { name: languages.en }),
    ).not.toHaveAttribute("aria-current");
  },
};
