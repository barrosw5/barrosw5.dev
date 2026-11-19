import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Welcome } from "./Welcome";
import en from "@/i18n/messages/en.json";
import pt from "@/i18n/messages/pt.json";

const meta = {
  title: "Pages/Welcome",
  component: Welcome,
} satisfies Meta<typeof Welcome>;

export default meta;
type Story = StoryObj<typeof meta>;

export const English: Story = {
  globals: { locale: "en" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(en.welcome.description)).toBeVisible();
  },
};

export const Portuguese: Story = {
  globals: { locale: "pt" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(pt.welcome.description)).toBeVisible();
  },
};
