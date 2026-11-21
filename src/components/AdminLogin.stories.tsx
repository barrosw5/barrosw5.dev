import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/routing";

import { AdminLogin } from "./AdminLogin";

const meta = {
  title: "Admin/AdminLogin",
  component: AdminLogin,
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/en/admin/login" } },
  },
} satisfies Meta<typeof AdminLogin>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Ready to sign in. */
export const Default: Story = {
  play: async ({ canvas, globals }) => {
    const locale = globals.locale as Locale;
    const t = messages[locale].admin.login;
    await expect(
      canvas.getByRole("heading", { level: 1, name: `${t.title} ${t.description}` }),
    ).toBeVisible();
    await expect(canvas.getByRole("button", { name: t.button })).toBeEnabled();
    await expect(canvas.getByRole("link", { name: t.back })).toHaveAttribute(
      "href",
      `/${locale}`,
    );
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  },
};

/** Signed in on GitHub with an account that isn't the admin's. */
export const Denied: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/en/admin/login", query: { error: "denied" } },
    },
  },
  play: async ({ canvas, globals }) => {
    const t = messages[globals.locale as Locale].admin.login;
    await expect(await canvas.findByRole("alert")).toHaveTextContent(t.errors.denied);
  },
};

/** The sign-in didn't finish (bad code, GitHub or Supabase unavailable). */
export const Failed: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/en/admin/login", query: { error: "failed" } },
    },
  },
  play: async ({ canvas, globals }) => {
    const t = messages[globals.locale as Locale].admin.login;
    await expect(await canvas.findByRole("alert")).toHaveTextContent(t.errors.failed);
  },
};
