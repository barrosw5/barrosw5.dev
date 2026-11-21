import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/routing";

import { AdminGate } from "./AdminGate";

const privateContent = <p>Private content</p>;

const meta = {
  title: "Admin/AdminGate",
  component: AdminGate,
  args: { children: privateContent },
} satisfies Meta<typeof AdminGate>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The server is still checking: nothing private is on screen. */
export const Checking: Story = {
  args: { access: new Promise<void>(() => {}) },
  play: async ({ canvas, globals }) => {
    const t = messages[globals.locale as Locale].admin;
    await expect(await canvas.findByRole("status")).toHaveTextContent(t.loading);
    await expect(canvas.queryByText("Private content")).not.toBeInTheDocument();
  },
};

/** The visitor is the admin: the content shows. */
export const Allowed: Story = {
  args: { access: Promise.resolve() },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Private content")).toBeVisible();
  },
};
