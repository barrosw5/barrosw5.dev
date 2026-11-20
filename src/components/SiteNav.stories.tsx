import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/routing";

import { SiteNav } from "./SiteNav";

const meta = {
  title: "Layout/SiteNav",
  component: SiteNav,
  parameters: {
    // The pill is fixed to the screen edge (bottom on the phone, top on
    // desktop): use the viewport button to see both
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/en" } },
  },
} satisfies Meta<typeof SiteNav>;

export default meta;
type Story = StoryObj<typeof meta>;

const pages = ["home", "projects", "about", "wishlist"] as const;

/** On the home page: "Home" is the current one. */
export const OnHome: Story = {
  play: async ({ canvas, globals }) => {
    const locale = globals.locale as Locale;
    const t = messages[locale].nav;

    await expect(canvas.getByRole("navigation", { name: t.label })).toBeVisible();
    for (const page of pages) {
      const link = canvas.getByRole("link", { name: t[page] });
      const path = page === "home" ? "" : `/${page}`;
      await expect(link).toHaveAttribute("href", `/${locale}${path}`);
    }
    await expect(canvas.getByRole("link", { name: t.home })).toHaveAttribute(
      "aria-current",
      "page",
    );
  },
};

/** Inside a project: "Projects" stays current on the pages inside it. */
export const OnAProject: Story = {
  parameters: {
    nextjs: { navigation: { pathname: "/en/projects/barrosw5-dev" } },
  },
  play: async ({ canvas, globals }) => {
    const t = messages[globals.locale as Locale].nav;
    await expect(
      canvas.getByRole("link", { name: t.projects }),
    ).toHaveAttribute("aria-current", "page");
    await expect(
      canvas.getByRole("link", { name: t.home }),
    ).not.toHaveAttribute("aria-current");
  },
};
