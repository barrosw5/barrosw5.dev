import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/routing";

import { AdminOverview } from "./AdminOverview";

const meta = {
  title: "Admin/AdminOverview",
  component: AdminOverview,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AdminOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The first screen after signing in. */
export const Default: Story = {
  play: async ({ canvas, globals }) => {
    const t = messages[globals.locale as Locale].admin.overview;
    await expect(
      canvas.getByRole("heading", { level: 1, name: `${t.title} ${t.description}` }),
    ).toBeVisible();
  },
};
