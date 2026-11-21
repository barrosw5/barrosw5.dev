import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor } from "storybook/test";

import { getPlaces } from "@/core/services/profileService";
import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/routing";

import { ClockWheel } from "./ClockWheel";

// A fixed moment in winter: 12:30 in Lisbon, 11:30 in Ponta Delgada, 13:30 in
// Amsterdam
const now = new Date("2026-01-15T12:30:00Z");

const meta = {
  title: "Layout/ClockWheel",
  component: ClockWheel,
  args: { places: getPlaces(), now },
  // Room for the wheel, which floats above and below its line
  decorators: [
    (Story) => (
      <div className="p-16 font-mono text-xs text-muted-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClockWheel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed: one line. Hover it, focus it with Tab, or tap it to open. */
export const Closed: Story = {
  play: async ({ canvas, globals }) => {
    const t = messages[globals.locale as Locale].footer;
    const wheel = canvas.getByRole("spinbutton", { name: t.clock });
    await expect(wheel).toHaveAttribute(
      "aria-valuetext",
      `${t.places.lisbon}, 12:30`,
    );
    await expect(canvas.getByText(t.places.lisbon)).toBeVisible();
    await expect(canvas.queryByText(t.places.pontaDelgada)).not.toBeInTheDocument();
  },
};

/** Open: the other places above and below, ready to scroll. */
export const Open: Story = {
  args: { defaultOpen: true },
  play: async ({ canvas, globals }) => {
    const t = messages[globals.locale as Locale].footer;
    await expect(canvas.getAllByText(t.places.pontaDelgada).length).toBeGreaterThan(0);
    await expect(canvas.getAllByText("11:30").length).toBeGreaterThan(0);
  },
};

/** Before the browser knows the time: the space is kept, without a clock. */
export const WithoutTime: Story = {
  args: { now: null },
  play: async ({ canvas, globals }) => {
    const t = messages[globals.locale as Locale].footer;
    await expect(canvas.getByRole("spinbutton")).toHaveAttribute(
      "aria-valuetext",
      t.places.lisbon,
    );
    await expect(canvas.queryByRole("time")).not.toBeInTheDocument();
  },
};

// Interaction test: runs in `pnpm test`, hidden from the sidebar ("!dev")
export const TurnsForeverWithTheKeyboard: Story = {
  tags: ["!dev"],
  play: async ({ canvas, globals, userEvent }) => {
    const t = messages[globals.locale as Locale].footer;
    const wheel = canvas.getByRole("spinbutton", { name: t.clock });
    const lisbon = `${t.places.lisbon}, 12:30`;
    const pontaDelgada = `${t.places.pontaDelgada}, 11:30`;
    const amsterdam = `${t.places.amsterdam}, 13:30`;

    await userEvent.tab();
    await expect(wheel).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(wheel).toHaveAttribute("aria-valuetext", pontaDelgada));
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(wheel).toHaveAttribute("aria-valuetext", amsterdam));
    // Past the end of the list, it comes back to the start
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(wheel).toHaveAttribute("aria-valuetext", lisbon));
    // And before the start, to the end
    await userEvent.keyboard("{ArrowUp}");
    await waitFor(() => expect(wheel).toHaveAttribute("aria-valuetext", amsterdam));
  },
};
