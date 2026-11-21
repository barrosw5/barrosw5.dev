import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor } from "storybook/test";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Welcome } from "@/components/Welcome";
import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/routing";

import type { ThemeTransition } from "./theme";

/**
 * The two theme transitions on a page-like screen. Click the sun/moon to play
 * them. The site uses the one in `activeThemeTransition` (src/theme/theme.ts).
 */
function TransitionPreview({ transition }: { transition: ThemeTransition }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex justify-end px-gutter py-4">
        <ThemeToggle transition={transition} />
      </div>
      <Welcome />
    </div>
  );
}

const meta = {
  title: "Foundations/Theme transitions",
  component: TransitionPreview,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof TransitionPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

const checkButton: Story["play"] = async ({ canvas, globals }) => {
  const t = messages[globals.locale as Locale].theme;
  await expect(canvas.getByRole("button", { name: t.label })).toBeVisible();
};

/** A line opens from the middle, with the brightness rising. */
export const Split: Story = {
  args: { transition: "split" },
  play: checkButton,
};

/** The page collapses like an old TV and turns back on. */
export const Crt: Story = {
  args: { transition: "crt" },
  play: checkButton,
};

// Interaction test: runs in `pnpm test`, hidden from the Storybook sidebar
// ("!dev") because it changes the state on its own.
export const ClickPlaysTheChosenTransition: Story = {
  tags: ["!dev"],
  args: { transition: "crt" },
  globals: { theme: "light" },
  play: async ({ canvas, globals, userEvent }) => {
    const t = messages[globals.locale as Locale].theme;
    const root = document.documentElement;

    await userEvent.click(canvas.getByRole("button", { name: t.label }));
    await expect(root.dataset.themeTransition).toBe("crt");
    await waitFor(() => expect(root).toHaveClass("dark"));

    // Cleaned up when the animation ends
    await waitFor(() => expect(root.dataset.themeTransition).toBeUndefined(), {
      timeout: 3000,
    });
  },
};

// Regression test: the CRT's opening once kept the thin line's high
// brightness, so light mode appeared as a white flash
export const CrtOpensDimmed: Story = {
  tags: ["!dev"],
  args: { transition: "crt" },
  globals: { theme: "dark" },
  play: async ({ canvas, globals, userEvent }) => {
    const t = messages[globals.locale as Locale].theme;
    const root = document.documentElement;

    await userEvent.click(canvas.getByRole("button", { name: t.label }));
    const opening = await waitFor(() => {
      const animation = document
        .getAnimations()
        .find((a) => (a as CSSAnimation).animationName === "theme-crt-on");
      expect(animation).toBeDefined();
      return animation as Animation;
    });
    opening.pause();

    // From the moment the picture opens until the end
    const duration = Number(opening.effect?.getComputedTiming().duration);
    for (const progress of [0.72, 0.8, 0.88, 0.96]) {
      opening.currentTime = duration * progress;
      const { filter } = getComputedStyle(root, "::view-transition-new(root)");
      const brightness = Number(filter.match(/brightness\(([\d.]+)\)/)?.[1]);
      await expect(brightness).toBeLessThanOrEqual(1);
    }

    for (const animation of document.getAnimations()) animation.finish();
    await waitFor(() => expect(root.dataset.themeTransition).toBeUndefined(), {
      timeout: 3000,
    });
  },
};
