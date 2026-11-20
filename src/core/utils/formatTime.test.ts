import { describe, expect, it } from "vitest";

import { formatTime } from "./formatTime";

// 13:05 UTC on a winter day (no summer time)
const date = new Date("2026-01-15T13:05:00Z");

describe("formatTime", () => {
  it("shows hours and minutes in the time zone", () => {
    expect(formatTime(date, "en", "Europe/Lisbon")).toBe("13:05");
    expect(formatTime(date, "pt", "Europe/Lisbon")).toBe("13:05");
  });

  it("puts the Azores one hour behind Lisbon", () => {
    expect(formatTime(date, "pt", "Atlantic/Azores")).toBe("12:05");
  });

  it("uses 24 hours, also in English", () => {
    const evening = new Date("2026-01-15T21:40:00Z");
    expect(formatTime(evening, "en", "Europe/Lisbon")).toBe("21:40");
  });
});
