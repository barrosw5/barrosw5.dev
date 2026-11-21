import { describe, expect, it } from "vitest";

import type { ProfileRow } from "@/core/types/profile";
import { formatTime } from "@/core/utils/formatTime";

import { getFallbackProfile, getPlaces, toProfile } from "./profileService";

describe("getPlaces", () => {
  it("starts with Lisbon by default", () => {
    expect(getPlaces()[0].id).toBe("lisbon");
  });

  it("starts with where I am and keeps every other place", () => {
    expect(getPlaces("amsterdam").map(({ id }) => id)).toEqual([
      "amsterdam",
      "lisbon",
      "pontaDelgada",
    ]);
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

describe("getFallbackProfile", () => {
  it("keeps the footer's place and links", () => {
    const profile = getFallbackProfile();
    expect(profile.currentPlace).toBe("lisbon");
    expect(profile.contacts.map(({ id }) => id)).toEqual(["github", "linkedin"]);
  });
});

describe("toProfile", () => {
  const text = { en: "English", pt: "Português" };
  const job = {
    id: "1",
    title: text,
    company: "Example",
    startDate: "2024-09",
    endDate: null,
    description: text,
  };
  const course = { ...job, company: undefined, school: "School" };
  const certificate = {
    id: "1",
    name: text,
    issuer: "Issuer",
    issuedOn: "2025-03",
    url: null,
  };
  const row: ProfileRow = {
    about_en: "Hello",
    about_pt: "Olá",
    doing_now_en: "Building",
    doing_now_pt: "A construir",
    current_place: "amsterdam",
    experience: [job],
    stack: [{ id: "1", name: "TypeScript" }],
    education: [course],
    certificates: [certificate],
    contacts: [{ id: "github", href: "https://github.com/barrosw5" }],
  };

  it("maps a complete row", () => {
    expect(toProfile(row)).toEqual({
      about: { en: "Hello", pt: "Olá" },
      doingNow: { en: "Building", pt: "A construir" },
      currentPlace: "amsterdam",
      experience: [job],
      stack: [{ id: "1", name: "TypeScript" }],
      education: [course],
      certificates: [certificate],
      contacts: [{ id: "github", href: "https://github.com/barrosw5" }],
    });
  });

  it("keeps a finished job's end date", () => {
    const finished = { ...job, endDate: "2025-06" };
    expect(toProfile({ ...row, experience: [finished] }).experience).toEqual([
      finished,
    ]);
  });

  it("leaves out malformed entries and keeps the valid ones", () => {
    const profile = toProfile({
      ...row,
      experience: [job, { ...job, startDate: "2024-13" }, "not an entry", null],
      stack: [{ id: "1" }],
      education: [{ ...course, title: "only one language" }],
      certificates: [{ ...certificate, issuedOn: "March" }],
    });

    expect(profile.experience).toEqual([job]);
    expect(profile.stack).toEqual([]);
    expect(profile.education).toEqual([]);
    expect(profile.certificates).toEqual([]);
  });

  it.each(["javascript:alert(1)", "data:text/html,x", "http://x.dev", "nope"])(
    "refuses the unsafe link %s",
    (href) => {
      const profile = toProfile({
        ...row,
        contacts: [{ id: "github", href }],
        certificates: [{ ...certificate, url: href }],
      });

      expect(profile.contacts).toEqual([]);
      expect(profile.certificates).toEqual([]);
    },
  );

  it("refuses an unknown contact", () => {
    const contacts = [{ id: "myspace", href: "https://myspace.com/me" }];
    expect(toProfile({ ...row, contacts }).contacts).toEqual([]);
  });

  it.each([{}, "text", null])("treats %j as an empty list", (value) => {
    expect(toProfile({ ...row, experience: value }).experience).toEqual([]);
  });

  it("uses the default place for an unknown one", () => {
    expect(toProfile({ ...row, current_place: "porto" }).currentPlace).toBe(
      "lisbon",
    );
  });

  it("doesn't take an inherited property for a place", () => {
    expect(
      toProfile({ ...row, current_place: "constructor" }).currentPlace,
    ).toBe("lisbon");
  });
});
