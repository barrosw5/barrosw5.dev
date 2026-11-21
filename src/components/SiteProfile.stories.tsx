import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Suspense } from "react";
import { expect } from "storybook/test";

import { getFallbackProfile } from "@/core/services/profileService";
import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/routing";

import { SiteFooter } from "./SiteFooter";
import { SiteProfile } from "./SiteProfile";

const meta = {
  title: "Layout/SiteProfile",
  component: SiteProfile,
  parameters: { layout: "fullscreen" },
  args: {
    profile: Promise.resolve({
      ...getFallbackProfile(),
      currentPlace: "amsterdam" as const,
    }),
    children: <SiteFooter />,
  },
  decorators: [
    (Story) => (
      <Suspense>
        <Story />
      </Suspense>
    ),
  ],
} satisfies Meta<typeof SiteProfile>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The profile has loaded: what's inside it uses that data. */
export const Loaded: Story = {
  play: async ({ canvas, globals }) => {
    const t = messages[globals.locale as Locale].footer;
    await expect(await canvas.findByText(t.places.amsterdam)).toBeVisible();
  },
};
