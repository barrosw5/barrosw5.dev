import { describe, expect, it } from "vitest";

import en from "./messages/en.json";
import ptPT from "./messages/pt-PT.json";

type Messages = { [key: string]: string | Messages };

/** Flattens nested messages into "a.b.c" keys. */
function keysOf(messages: Messages, prefix = ""): string[] {
  return Object.entries(messages).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string" ? [path] : keysOf(value, path);
  });
}

/** Flattens nested messages into "a.b.c" → value pairs. */
function entriesOf(messages: Messages): Array<[string, string]> {
  return keysOf(messages).map((path) => [
    path,
    path.split(".").reduce<Messages | string>(
      (node, part) => (node as Messages)[part],
      messages,
    ) as string,
  ]);
}

describe("translations", () => {
  it("en and pt-PT have exactly the same keys", () => {
    expect(keysOf(ptPT).sort()).toEqual(keysOf(en).sort());
  });

  it.each([
    ["en", en],
    ["pt-PT", ptPT],
  ])("%s has no empty translations", (_locale, messages) => {
    const empty = entriesOf(messages)
      .filter(([, value]) => value.trim() === "")
      .map(([path]) => path);
    expect(empty).toEqual([]);
  });
});
