import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/routing";

import { SiteFooter } from "./SiteFooter";

const meta = {
  title: "Layout/SiteFooter",
  component: SiteFooter,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SiteFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

/** With the real clock: the time is your computer's now, in Lisbon. */
export const Default: Story = {
  play: async ({ canvas, globals }) => {
    const t = messages[globals.locale as Locale].footer;

    await expect(canvas.getByText(t.places.lisbon)).toBeVisible();
    await expect(canvas.getByText(/^\d{2}:\d{2}$/)).toBeVisible();

    for (const id of ["github", "linkedin"] as const) {
      const link = canvas.getByRole("link", { name: new RegExp(t.contacts[id]) });
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    await expect(
      canvas.getByText(new RegExp(`© ${new Date().getFullYear()}`)),
    ).toBeVisible();
  },
};
