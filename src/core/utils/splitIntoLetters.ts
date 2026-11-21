import { languageTags, type Locale } from "@/i18n/routing";

/**
 * Splits a sentence into words, and each word into the letters a person sees.
 *
 * Uses `Intl.Segmenter` instead of `text.split("")`, which can cut one visible
 * letter in two: "ã" may be stored as "a" + a separate tilde, and an emoji as
 * several characters.
 *
 * @example splitIntoLetters("Olá mundo", "pt") // [["O","l","á"], ["m","u","n","d","o"]]
 */
export function splitIntoLetters(text: string, locale: Locale): string[][] {
  const segmenter = new Intl.Segmenter(languageTags[locale], {
    granularity: "grapheme",
  });

  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      Array.from(segmenter.segment(word), ({ segment }) => segment),
    );
}
