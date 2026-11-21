"use client";

import { useLocale } from "next-intl";
import { type CSSProperties, Fragment } from "react";

import { splitIntoLetters } from "@/core/utils/splitIntoLetters";
import { useRevealOnce } from "@/hooks/useRevealOnce";
import { cn } from "@/lib/utils";

/**
 * How a headline appears (the animations are CSS, in globals.css):
 * - "rise": each word rises from below, inside an invisible window
 * - "soft": each letter comes out of a blur
 */
export type HeadlineReveal = "rise" | "soft";

/** The one the site uses. Change this line to switch. */
export const activeHeadlineReveal: HeadlineReveal = "rise"; // or "soft"

/** The wait between two pieces, and the most the whole cascade may take. */
const timing: Record<HeadlineReveal, { gap: number; maxTotal: number }> = {
  rise: { gap: 70, maxTotal: 500 },
  soft: { gap: 24, maxTotal: 800 },
};

export interface RevealHeadlinePart {
  text: string;
  /** Shows this part in grey: the second tone of a two-tone headline. */
  muted?: boolean;
}

/**
 * A page title that animates in with CSS only, so it starts on the first
 * paint, without waiting for JavaScript. Screen readers get the whole
 * sentence: the animated pieces are `aria-hidden`, and a visually hidden copy
 * holds the text.
 */
export function RevealHeadline({
  parts,
  effect = activeHeadlineReveal,
  className,
}: {
  parts: RevealHeadlinePart[];
  effect?: HeadlineReveal;
  className?: string;
}) {
  const locale = useLocale();
  const sentence = parts.map((part) => part.text).join(" ");
  const ref = useRevealOnce<HTMLHeadingElement>(sentence);

  const words = parts.map((part) => splitIntoLetters(part.text, locale));
  const pieces = words
    .flat()
    .reduce((sum, word) => sum + (effect === "rise" ? 1 : word.length), 0);
  const { gap, maxTotal } = timing[effect];
  const style = {
    "--reveal-gap": `${Math.min(gap, maxTotal / Math.max(pieces, 1))}ms`,
  } as CSSProperties;

  // Each animated piece knows its place in the cascade through --i
  let index = 0;
  const piece = (content: string) => (
    <span
      data-reveal-item
      className="inline-block"
      style={{ "--i": index++ } as CSSProperties}
    >
      {content}
    </span>
  );

  return (
    <h1
      key={sentence}
      ref={ref}
      data-text-reveal={effect}
      style={style}
      className={cn("relative", className)}
    >
      <span className="sr-only">{sentence}</span>
      <span aria-hidden>
        {parts.map((part, partIndex) => (
          <Fragment key={partIndex}>
            {partIndex > 0 && " "}
            <span className={cn(part.muted && "text-muted-foreground")}>
              {words[partIndex].map((word, wordIndex) => (
                <Fragment key={wordIndex}>
                  {wordIndex > 0 && " "}
                  {/* The word's window: a word never breaks across lines */}
                  <span
                    data-reveal-mask
                    className="inline-block whitespace-nowrap"
                  >
                    {effect === "rise"
                      ? piece(word.join(""))
                      : word.map((letter, letterIndex) => (
                          <Fragment key={letterIndex}>{piece(letter)}</Fragment>
                        ))}
                  </span>
                </Fragment>
              ))}
            </span>
          </Fragment>
        ))}
      </span>
    </h1>
  );
}
