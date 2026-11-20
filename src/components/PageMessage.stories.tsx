import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/routing";

import { PageMessage } from "./PageMessage";

const meta = {
  title: "Pages/PageMessage",
  component: PageMessage,
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/en/abc" } },
  },
} satisfies Meta<typeof PageMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The 404 page: an address that doesn't exist. */
export const NotFound: Story = {
  args: { kind: "notFound" },
  play: async ({ canvas, globals, args }) => {
    const locale = globals.locale as Locale;
    const t = messages[locale].pageMessage;
    const m = t[args.kind];
    await expect(
      canvas.getByRole("heading", { level: 1, name: `${m.title} ${m.description}` }),
    ).toBeVisible();
    await expect(canvas.getByRole("link", { name: t.back })).toHaveAttribute(
      "href",
      `/${locale}`,
    );
  },
};

/** A page that isn't built yet (Projects, About, Wishlist for now). */
export const UnderConstruction: Story = {
  args: { kind: "underConstruction" },
  play: NotFound.play,
};
