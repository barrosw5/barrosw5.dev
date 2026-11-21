import { describe, expect, it } from "vitest";

import { findUnlistedCommand } from "./commandService";

// A made-up command, sealed the same way as the real ones
const commands = [
  {
    digest: "184858a00fd7971f810848266ebcecee5e8b69972c5ffaed622f5ee078671aed",
    target: "57090815131d1a0e09",
  },
];

describe("findUnlistedCommand", () => {
  it("opens the command with its exact text", async () => {
    await expect(findUnlistedCommand("xyzzy", commands)).resolves.toEqual({
      text: "xyzzy",
      href: "/projects",
    });
  });

  it("doesn't care about case", async () => {
    await expect(findUnlistedCommand("XyZzY", commands)).resolves.toEqual({
      text: "XyZzY",
      href: "/projects",
    });
  });

  it.each(["", "x", "xyzz", "xyzzyy", " xyzzy"])(
    "finds nothing for %j",
    async (text) => {
      await expect(findUnlistedCommand(text, commands)).resolves.toBeNull();
    },
  );
});
