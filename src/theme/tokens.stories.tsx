import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { expect } from "storybook/test";

/**
 * The design tokens from src/app/globals.css, drawn so they can be checked by
 * eye. Use the toolbar to see them in light/dark mode, in each language, and
 * at phone and desktop widths (viewport button).
 *
 * The class names are written out in full on purpose: Tailwind only generates
 * the classes it finds written in the code, so `bg-${name}` would not work.
 */
const meta = {
  title: "Foundations/Design tokens",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Page padding is the `gutter` token, so it grows with the viewport too. */
function Page({ children }: { children: ReactNode }) {
  return <div className="p-gutter">{children}</div>;
}

function TokenName({ children }: { children: ReactNode }) {
  return (
    <code className="font-mono text-xs text-muted-foreground">{children}</code>
  );
}

const colours = [
  { name: "background", className: "bg-background" },
  { name: "foreground", className: "bg-foreground" },
  { name: "card", className: "bg-card" },
  { name: "muted", className: "bg-muted" },
  { name: "muted-foreground", className: "bg-muted-foreground" },
  { name: "border", className: "bg-border" },
  { name: "primary", className: "bg-primary" },
  { name: "destructive", className: "bg-destructive" },
  { name: "status-available", className: "bg-status-available" },
  { name: "status-live", className: "bg-status-live" },
] as const;

function ColourSwatches() {
  return (
    <Page>
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {colours.map(({ name, className }) => (
          <li key={name} className="flex flex-col gap-2">
            <div
              data-testid={name}
              className={`h-16 rounded-lg border ${className}`}
            />
            <TokenName>{name}</TokenName>
          </li>
        ))}
      </ul>
    </Page>
  );
}

const typeScale = [
  { name: "text-display", className: "text-display" },
  { name: "text-headline", className: "text-headline" },
  { name: "text-title", className: "text-title" },
  { name: "text-base", className: "text-base" },
  { name: "text-sm", className: "text-sm" },
] as const;

function TypeScale() {
  const t = useTranslations();

  return (
    <Page>
      <div className="flex flex-col gap-section">
        {/* Two-tone headline: full colour first, then grey */}
        <p className="text-display">
          {t("welcome.title")}{" "}
          <span className="text-muted-foreground">
            {t("welcome.description")}
          </span>
        </p>
        <ul className="flex flex-col gap-10">
          {typeScale.map(({ name, className }) => (
            <li key={name} className="flex flex-col gap-2">
              <TokenName>{name}</TokenName>
              <p data-testid={name} className={className}>
                {t("metadata.description")}
              </p>
            </li>
          ))}
          <li className="flex flex-col gap-2">
            <TokenName>font-mono</TokenName>
            <p data-testid="font-mono" className="font-mono text-sm">
              N°03/12 · 14:32
            </p>
          </li>
        </ul>
      </div>
    </Page>
  );
}

const spacing = [
  { name: "1 · 4px", className: "w-1" },
  { name: "2 · 8px", className: "w-2" },
  { name: "4 · 16px", className: "w-4" },
  { name: "6 · 24px", className: "w-6" },
  { name: "8 · 32px", className: "w-8" },
  { name: "12 · 48px", className: "w-12" },
  { name: "16 · 64px", className: "w-16" },
  { name: "gutter", className: "w-gutter" },
  { name: "section", className: "w-section" },
] as const;

function SpacingScale() {
  return (
    <Page>
      <ul className="flex flex-col gap-4">
        {spacing.map(({ name, className }) => (
          <li key={name} className="flex items-center gap-4">
            <span className="w-24 shrink-0">
              <TokenName>{name}</TokenName>
            </span>
            <div
              data-testid={name}
              className={`h-4 rounded-sm bg-foreground ${className}`}
            />
          </li>
        ))}
      </ul>
    </Page>
  );
}

const radii = [
  { name: "rounded-sm", className: "rounded-sm" },
  { name: "rounded-md", className: "rounded-md" },
  { name: "rounded-lg", className: "rounded-lg" },
  { name: "rounded-xl", className: "rounded-xl" },
  { name: "rounded-2xl", className: "rounded-2xl" },
  { name: "rounded-3xl", className: "rounded-3xl" },
  { name: "rounded-full", className: "rounded-full" },
] as const;

function RadiusScale() {
  return (
    <Page>
      <ul className="flex flex-wrap gap-6">
        {radii.map(({ name, className }) => (
          <li key={name} className="flex flex-col items-center gap-2">
            <div
              data-testid={name}
              className={`size-20 border bg-card ${className}`}
            />
            <TokenName>{name}</TokenName>
          </li>
        ))}
      </ul>
    </Page>
  );
}

export const Colours: Story = {
  render: () => <ColourSwatches />,
  // A colour class that doesn't exist leaves the swatch transparent
  play: async ({ canvas }) => {
    for (const { name } of colours) {
      const swatch = canvas.getByTestId(name);
      await expect(getComputedStyle(swatch).backgroundColor).not.toBe(
        "rgba(0, 0, 0, 0)",
      );
    }
  },
};

export const Typography: Story = {
  render: () => <TypeScale />,
  play: async ({ canvas }) => {
    const font = (testId: string) =>
      getComputedStyle(canvas.getByTestId(testId)).fontFamily;
    await expect(font("text-base")).toContain("Geist");
    await expect(font("font-mono")).toContain("Geist Mono");

    // Fluid sizes never go below the phone size (40px for display)
    const displaySize = parseFloat(
      getComputedStyle(canvas.getByTestId("text-display")).fontSize,
    );
    await expect(displaySize).toBeGreaterThanOrEqual(40);
  },
};

export const Spacing: Story = {
  render: () => <SpacingScale />,
  play: async ({ canvas }) => {
    const width = (testId: string) =>
      canvas.getByTestId(testId).getBoundingClientRect().width;
    await expect(width("4 · 16px")).toBe(16);
    // The fluid steps are at least their phone size
    await expect(width("gutter")).toBeGreaterThanOrEqual(20);
    await expect(width("section")).toBeGreaterThanOrEqual(64);
  },
};

export const Radii: Story = {
  render: () => <RadiusScale />,
  play: async ({ canvas }) => {
    // rounded-lg is --radius itself (0.75rem = 12px)
    const corner = getComputedStyle(
      canvas.getByTestId("rounded-lg"),
    ).borderTopLeftRadius;
    await expect(corner).toBe("12px");
  },
};
