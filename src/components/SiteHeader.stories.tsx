import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/routing";

import { SiteHeader } from "./SiteHeader";

const meta = {
  title: "Layout/SiteHeader",
  component: SiteHeader,
  parameters: {
    // Use the viewport button: on the phone the theme and language buttons
    // are in the bottom pill, on desktop in the top right corner. Press Tab
    // to see the "skip to content" link.
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/en" } },
  },
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, globals }) => {
    const t = messages[globals.locale as Locale].nav;
    await expect(canvas.getByRole("navigation", { name: t.label })).toBeVisible();
    // Hidden until focused, but there for keyboard users
    await expect(canvas.getByRole("link", { name: t.skip })).toHaveAttribute(
      "href",
      "#content",
    );
  },
};
