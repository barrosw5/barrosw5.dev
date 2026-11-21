import { describe, expect, it } from "vitest";

import { splitIntoLetters } from "./splitIntoLetters";

describe("splitIntoLetters", () => {
  it("splits a sentence into words and letters", () => {
    expect(splitIntoLetters("Olá mundo", "pt")).toEqual([
      ["O", "l", "á"],
      ["m", "u", "n", "d", "o"],
    ]);
  });

  it("keeps a letter and its accent together", () => {
    // "a" followed by a separate combining tilde: one letter on screen
    expect(splitIntoLetters("não".normalize("NFD"), "pt")).toEqual([
      ["n", "ã", "o"],
    ]);
  });

  it("ignores extra spaces", () => {
    expect(splitIntoLetters("  a   b ", "en")).toEqual([["a"], ["b"]]);
  });

  it("returns nothing for empty text", () => {
    expect(splitIntoLetters("   ", "en")).toEqual([]);
  });
});
