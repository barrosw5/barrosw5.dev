import { describe, expect, it } from "vitest";

import { formatTime } from "@/core/utils/formatTime";

import { getCurrentPlace, getPlaces } from "./profileService";

describe("getPlaces", () => {
  it("starts with where I am", () => {
    expect(getPlaces()[0]).toEqual(getCurrentPlace());
  });

  it("lists each place once", () => {
    const ids = getPlaces().map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(
      expect.arrayContaining(["lisbon", "pontaDelgada", "amsterdam"]),
    );
  });

  it.each([
    ["winter", "2026-01-15T12:30:00Z", "13:30"],
    ["summer", "2026-07-15T12:30:00Z", "14:30"],
  ])("Amsterdam is an hour ahead of Lisbon in %s", (_season, iso, expected) => {
    const { timeZone } = getPlaces().find(({ id }) => id === "amsterdam")!;
    expect(formatTime(new Date(iso), "pt", timeZone)).toBe(expected);
  });

  it.each([
    ["winter", "2026-01-15T12:30:00Z", "12:30", "11:30"],
    ["summer", "2026-07-15T12:30:00Z", "13:30", "12:30"],
  ])("Ponta Delgada is an hour behind Lisbon in %s", (_season, iso, lisbon, azores) => {
    const zone = (id: string) =>
      getPlaces().find((place) => place.id === id)!.timeZone;
    const now = new Date(iso);
    expect(formatTime(now, "pt", zone("lisbon"))).toBe(lisbon);
    expect(formatTime(now, "pt", zone("pontaDelgada"))).toBe(azores);
  });
});
