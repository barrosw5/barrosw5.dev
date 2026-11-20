import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/routing";

import { Welcome } from "./Welcome";

const meta = {
  title: "Pages/Welcome",
  component: Welcome,
  // The component has its own page padding (px-gutter)
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Welcome>;

export default meta;
type Story = StoryObj<typeof meta>;

// Follows the toolbar language and theme
export const Default: Story = {
  play: async ({ canvas, globals }) => {
    const t = messages[globals.locale as Locale].welcome;
    // One two-tone headline: the name, then the line in grey
    await expect(
      canvas.getByRole("heading", {
        level: 1,
        name: `${t.title} ${t.description}`,
      }),
    ).toBeVisible();
  },
};
