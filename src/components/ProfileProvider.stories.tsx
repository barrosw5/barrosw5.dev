import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { getFallbackProfile } from "@/core/services/profileService";
import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/routing";

import { ProfileProvider } from "./ProfileProvider";
import { SiteFooter } from "./SiteFooter";

const meta = {
  title: "Layout/ProfileProvider",
  component: ProfileProvider,
  parameters: { layout: "fullscreen" },
  args: {
    profile: {
      ...getFallbackProfile(),
      currentPlace: "pontaDelgada",
      contacts: [{ id: "github", href: "https://github.com/example" }],
    },
    children: <SiteFooter />,
  },
} satisfies Meta<typeof ProfileProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The footer inside it shows this profile's place and links. */
export const WithProfile: Story = {
  play: async ({ canvas, globals }) => {
    const t = messages[globals.locale as Locale].footer;
    await expect(canvas.getByText(t.places.pontaDelgada)).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: new RegExp(t.contacts.github) }),
    ).toHaveAttribute("href", "https://github.com/example");
    await expect(
      canvas.queryByRole("link", { name: new RegExp(t.contacts.linkedin) }),
    ).not.toBeInTheDocument();
  },
};

/** A profile with no contacts: the footer shows no links. */
export const WithoutContacts: Story = {
  args: { profile: { ...getFallbackProfile(), contacts: [] } },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
  },
};
