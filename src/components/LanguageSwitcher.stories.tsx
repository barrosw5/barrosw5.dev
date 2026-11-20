import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { messages } from "@/i18n/messages";
import { routing, type Locale } from "@/i18n/routing";

import { LanguageSwitcher } from "./LanguageSwitcher";

const meta = {
  title: "Components/LanguageSwitcher",
  component: LanguageSwitcher,
  parameters: {
    nextjs: {
      // The component uses next/navigation (through next-intl), which needs
      // Storybook's App Router mock. Pretend we are on the wishlist page, to
      // check the links keep the page and only change the language.
      appDirectory: true,
      navigation: { pathname: "/en/wishlist" },
    },
  },
} satisfies Meta<typeof LanguageSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

// Follows the toolbar language. Click the other language to switch: the
// toolbar changes too, like the page would on the site (that switching is a
// Storybook helper in .storybook/preview.tsx; the real navigation is covered
// by the e2e tests).
export const Default: Story = {
  play: async ({ canvas, globals }) => {
    const current = globals.locale as Locale;
    const t = messages[current].languageSwitcher;

    await expect(
      canvas.getByRole("navigation", { name: t.label }),
    ).toBeVisible();

    for (const locale of routing.locales) {
      const link = canvas.getByRole("link", { name: t.languages[locale] });
      // Same page, in that language
      await expect(link).toHaveAttribute("href", `/${locale}/wishlist`);
      // Only the current language is marked
      if (locale === current) {
        await expect(link).toHaveAttribute("aria-current", "true");
      } else {
        await expect(link).not.toHaveAttribute("aria-current");
      }
    }
  },
};
