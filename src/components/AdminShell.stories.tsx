import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/routing";

import { AdminOverview } from "./AdminOverview";
import { AdminShell } from "./AdminShell";

const meta = {
  title: "Admin/AdminShell",
  component: AdminShell,
  args: { children: <AdminOverview /> },
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/en/admin" } },
  },
} satisfies Meta<typeof AdminShell>;

export default meta;
type Story = StoryObj<typeof meta>;

/** On the overview: its link is marked as the current page. */
export const Default: Story = {
  play: async ({ canvas, globals }) => {
    const locale = globals.locale as Locale;
    const t = messages[locale].admin.nav;
    const nav = canvas.getByRole("navigation", { name: t.label });
    await expect(nav).toBeVisible();
    await expect(canvas.getByRole("link", { name: t.overview })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(canvas.getByRole("link", { name: t.viewSite })).toHaveAttribute(
      "href",
      `/${locale}`,
    );
    await expect(canvas.getByRole("button", { name: t.signOut })).toBeEnabled();
  },
};

/** On a page that isn't in the menu: nothing is marked. */
export const NoCurrentPage: Story = {
  parameters: {
    nextjs: { appDirectory: true, navigation: { pathname: "/en/admin/other" } },
  },
  play: async ({ canvas, globals }) => {
    const t = messages[globals.locale as Locale].admin.nav;
    await expect(
      canvas.getByRole("link", { name: t.overview }),
    ).not.toHaveAttribute("aria-current");
  },
};
