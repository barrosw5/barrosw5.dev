import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor } from "storybook/test";

import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/routing";

import { type HeadlineReveal, RevealHeadline } from "./RevealHeadline";

/** Uses the site's real texts, so it follows the toolbar language. */
function Preview({ effect, locale }: { effect: HeadlineReveal; locale: Locale }) {
  const { title, description } = messages[locale].welcome;
  return (
    <div className="px-gutter py-12">
      <RevealHeadline
        effect={effect}
        parts={[{ text: title }, { text: description, muted: true }]}
        className="max-w-4xl text-display text-balance"
      />
    </div>
  );
}

const meta = {
  title: "Components/RevealHeadline",
  component: Preview,
  parameters: { layout: "fullscreen" },
  // Press the "Remount" button in Storybook's toolbar to watch it again
  render: (args, { globals }) => (
    <Preview {...args} locale={globals.locale as Locale} />
  ),
  args: { effect: "rise", locale: "en" },
  argTypes: { locale: { table: { disable: true } } },
} satisfies Meta<typeof Preview>;

export default meta;
type Story = StoryObj<typeof meta>;

const finishes: Story["play"] = async ({ canvas, globals }) => {
  const { title, description } = messages[globals.locale as Locale].welcome;

  // Screen readers get the whole sentence, piece by piece would be unreadable
  const heading = canvas.getByRole("heading", {
    level: 1,
    name: `${title} ${description}`,
  });
  await waitFor(() => expect(heading).toHaveAttribute("data-reveal-done"), {
    timeout: 4000,
  });
};

/** Each word rises from below, inside an invisible window. */
export const Rise: Story = { args: { effect: "rise" }, play: finishes };

/** Each letter comes out of a blur. */
export const Soft: Story = { args: { effect: "soft" }, play: finishes };
